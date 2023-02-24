import { AnimatePresence, motion } from "framer-motion";
import type { NextPage } from "next";
import Head from "next/head";
import { useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import type { GradelevelType } from "../components/DropDown";
import { DropDown } from "../components/DropDown";
import type {
  LessonPlanType,
  LessonDurationType,
} from "../components/LessonPlanDropDown";
import { LessonPlanDropDown } from "../components/LessonPlanDropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Balancer from "react-wrap-balancer";
import React from "react";
import SocialIcon from "../components/SocialIcon";

// This defines the types of data that the API response should have
interface ResponseType {
  status: number;
  body: string;
  headers: {
    "X-Ratelimit-Limit": string;
    "X-Ratelimit-Remaining": string;
    "X-Ratelimit-Reset": string;
  };
}

// This extends the ResponseType interface to include an optional error message
interface ApiResponse extends ResponseType {
  error?: string;
}

// This defines the Home component, which is a functional component with no props
const Home: NextPage = () => {
  // These states store the component's data and whether it is currently loading
  const [, setResponse] = useState<ResponseType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [gradelevel, setGradelevel] = useState<GradelevelType>("Grade 12");
  const [lessonPlanType, setLessonPlanType] = useState<LessonPlanType>(
    "Detailed Lesson Plan"
  );
  const [lessonDuration, setLessonDuration] =
    useState<LessonDurationType>("30-60 minutes");
  const [generatedTopics, setGeneratedTopics] = useState<string>("");

  let prompt: string;
  if (topic.trim() === "") {
    if (lessonPlanType === "Detailed Lesson Plan") {
      prompt = `Please create a complete and ${lessonPlanType}, appropriate for ${gradelevel}, that is ${lessonDuration} in duration. Please include specific learning objectives, teaching strategies, materials needed, a detailed timeline for each activity, and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan. You may choose the topic of the lesson plan based on your expertise and educational goals.`;
    } else {
      prompt = `Please create a ${lessonPlanType}, appropriate for ${gradelevel}, that is ${lessonDuration} in duration. Please include general learning objectives, a list of materials needed, and a basic description of teaching strategies and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan. You may choose the topic of the lesson plan based on your expertise and educational goals.`;
    }
  } else if (lessonPlanType === "Detailed Lesson Plan") {
    prompt = `Please create a complete and ${lessonPlanType} for a ${topic} lesson, appropriate for ${gradelevel}, that is ${lessonDuration} in duration. Please include specific learning objectives, teaching strategies, materials needed, a detailed timeline for each activity, and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan.`;
  } else {
    prompt = `Please create a ${lessonPlanType} for a ${topic} lesson, appropriate for ${gradelevel}, that is ${lessonDuration} in duration. Please include general learning objectives, a list of materials needed, and a basic description of teaching strategies and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan.`;
  }

  // Define an asynchronous function that sends a POST request to an API route and displays the response
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    generateTopic().catch((error) => {
      // Handle errors here
      console.error(error);
      alert("An error occurred. Please try again.");
    });
  };

  const generateTopic = async (): Promise<void> => {
    setGeneratedTopics(""); // Clear any previous generated topics
    setLoading(true); // Set the loading state to true

    // Send a POST request to the API route with the prompt in the request body
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
      }),
    });

    // Handle errors when the response status is outside the 200-299 range
    if (response.status < 200 || response.status >= 300) {
      // Construct an error object with details about the response
      const error: ApiResponse = {
        status: response.status,
        body: await response.text(),
        headers: {
          "X-Ratelimit-Limit": response.headers.get(
            "X-Ratelimit-Limit"
          ) as string,
          "X-Ratelimit-Remaining": response.headers.get(
            "X-Ratelimit-Remaining"
          ) as string,
          "X-Ratelimit-Reset": response.headers.get(
            "X-Ratelimit-Reset"
          ) as string,
        },
        error: `Request failed with status code ${response.status}`,
      };

      // Set the response state to the error and show an alert to the user
      setResponse(error);
      setLoading(false);
      alert(
        `You have no API requests remaining today. Try again after 24 hours.`
      );
      return;
    }

    // Set the ratelimitRemaining state to the value of the X-Ratelimit-Remaining header
    // setRatelimitRemaining(response.headers.get("X-Ratelimit-Remaining") || "");

    // Read the response body as a stream and update the generated topics state with each chunk of data
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      setGeneratedTopics((prev) => prev + chunkValue);
    }

    setLoading(false); // Set the loading state to false once the response is fully received
  };

  // This function limits the number of characters in a text area input
  const limitCharacters = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const maxCharacters = 200; // Set the maximum number of characters allowed
    const currentCharacters = e.target.value.length; // Get the current number of characters

    // Check if the current number of characters exceeds the maximum
    if (currentCharacters > maxCharacters) {
      // If it does, truncate the input value to the maximum number of characters
      e.target.value = e.target.value.slice(0, maxCharacters);
      // Show an error message to the user using a toast notification
      toast.error("You have reached the maximum number of characters.");
    }
  };

  // This line splits a string into an array of strings, with each element representing a line in the original string
  const lines: string[] = generatedTopics.split("\n");

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center py-2">
      <Head>
        <title>
          Effortless Lesson Planning with Our AI-Powered Generator - Better
          Lessons
        </title>
      </Head>

      <Header href="/" />
      <main className="sm:mt-15 mt-12 flex flex-1 flex-col items-center justify-center px-4 text-center">
        <a
          className="mb-10 flex max-w-fit items-center justify-center space-x-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 shadow-md transition-colors hover:bg-gray-100"
          href="/github"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Mark Anthony Llego's Github profile"
          aria-describedby="github-link"
        >
          <SocialIcon platform="github" size={25} />
          <p>Star on Github</p>
        </a>
        <h2 className="mx-auto max-w-4xl text-5xl font-bold tracking-normal text-slate-900 sm:text-6xl md:text-7xl">
          <Balancer>
            Goodbye to Boring Lesson Plans, Hello Engaging Teaching
          </Balancer>
        </h2>
        <p
          className="mx-auto mt-6 max-w-xl text-base leading-normal text-slate-900 sm:mt-12 sm:text-lg lg:text-lg"
          aria-label="Reading Passages"
        >
          <Balancer>
            Upgrade your lesson planning with our AI-powered generator. Say
            goodbye to boring plans and hello to engaging, effective teaching.
            Our technology creates personalized lesson plans to fit your
            teaching style and students&apos; needs. Revolutionize the way you
            teach - try it now!
          </Balancer>
        </p>
        <div className="w-full max-w-xl px-6">
          <div className="align-items-center mt-10 flex items-center">
            <span className="leading-zero flex h-6 w-6 items-center justify-center rounded-full bg-black p-2 text-center text-white">
              1
            </span>
            <p className="ml-3 text-left text-base leading-normal text-slate-900 sm:text-lg lg:text-lg">
              <Balancer>
                Please input your desired topic or subject. If you leave the
                field blank, a random lesson will be generated.
              </Balancer>
            </p>
          </div>
          <form onSubmit={handleSubmit}>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onInput={limitCharacters}
              rows={4}
              className="focus:shadow-outline mt-5 w-full rounded-lg shadow-sm focus:outline-none"
              placeholder={
                "For example, the topics could be: Exploring the Human Body: An Introduction to Anatomy and Physiology, The American Revolution: Understanding Causes and Effects, The Wonderful World of Water: Understanding Properties and States of Matter, Discovering Diversity: Understanding Different Cultures and Traditions, Let's Write a Story: An Introduction to Creative Writing and Storytelling, or Making Music: An Introduction to Music Theory and Composition."
              }
              aria-label="Enter a theme, subject matter, or content focus. (Leave blank to generate a random passage.)"
            />
            <p className="mt-2 text-right text-sm text-gray-500">
              {topic.length}/200
            </p>
            <div className="align-items-center mt-10 flex items-center">
              <span className="leading-zero flex h-6 w-6 items-center justify-center rounded-full bg-black p-2 text-center text-white">
                2
              </span>
              <p className="ml-3 text-left text-base leading-normal text-slate-900 sm:text-lg lg:text-lg">
                <Balancer>Please choose a grade level for the lesson.</Balancer>
              </p>
            </div>
            <div className="mt-3 block">
              <DropDown
                gradelevel={gradelevel}
                setGradelevel={(newGradelevel) => setGradelevel(newGradelevel)}
              />
            </div>
            <div className="align-items-center mt-10 flex items-center">
              <span className="leading-zero flex h-6 w-6 items-center justify-center rounded-full bg-black p-2 text-center text-white">
                3
              </span>
              <p className="ml-3 text-left text-base leading-normal text-slate-900 sm:text-lg lg:text-lg">
                <Balancer>
                  Please choose the level of detail you prefer for your lesson
                  and indicate the duration you would like it to be.
                </Balancer>
              </p>
            </div>
            <div className="mt-3 block">
              <LessonPlanDropDown
                lessonPlanType={lessonPlanType}
                setLessonPlanType={(newLessonPlanType) =>
                  setLessonPlanType(newLessonPlanType)
                }
                lessonDuration={lessonDuration}
                setLessonDuration={(newLessonDuration) =>
                  setLessonDuration(newLessonDuration)
                }
              />
            </div>
            {!loading && (
              <button
                className="mt-10 w-full rounded-lg bg-black px-4 py-2 text-base font-bold text-white transition-colors hover:bg-black/80"
                type="submit"
              >
                Generate Lesson Plan &rarr;
              </button>
            )}
            {loading && (
              <button
                className="mt-10 w-full rounded-lg bg-black px-4 py-2 text-base text-white"
                disabled
              >
                <LoadingDots color="white" style="large" />
              </button>
            )}
          </form>
        </div>
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{ duration: 2000 }}
        />
        <hr className="border-1 h-px bg-gray-700 dark:bg-gray-700" />
        <ResizablePanel>
          <AnimatePresence mode="wait">
            <motion.div className="my-10 space-y-10">
              {generatedTopics && (
                <>
                  <div>
                    <h2 className="mx-auto max-w-4xl px-3 text-2xl font-bold text-slate-900 md:text-3xl lg:text-4xl">
                      <Balancer>Generated Lesson Plan</Balancer>
                    </h2>
                  </div>
                  <div className="mx-auto flex max-w-xl flex-col items-center justify-center space-y-8 px-3">
                    <div
                      className="relative transform cursor-pointer rounded-xl border bg-sky-200 p-4 shadow-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:bg-sky-100 hover:shadow-lg"
                      onClick={() => {
                        const passage = `\nBy: Mark Anthony Llego \n\n${generatedTopics}`;
                        navigator.clipboard
                          .writeText(passage)
                          .then(() => {
                            toast("Generated Passage Copied!", {
                              icon: "✂️",
                            });
                          })
                          .catch((error) => {
                            console.error(error);
                          });
                      }}
                    >
                      <p className="text-start text-base leading-normal text-slate-900 sm:text-lg lg:text-lg">
                        {lines.map((line, index) => (
                          <React.Fragment key={index}>
                            {index === 0 ? (
                              <span className="font-bold">{line}</span>
                            ) : (
                              line
                            )}
                            <br />
                          </React.Fragment>
                        ))}
                        <br />
                        <span className="font-bold">Hint: </span>
                        <span>
                          Ready to copy the generated lesson plan? Simply click
                          it!
                        </span>
                      </p>
                    </div>
                    <div className="mt-2 rounded-lg bg-yellow-200 p-4 text-start text-base text-slate-900 sm:text-lg lg:text-lg">
                      <h2 className="mb-2 font-bold">Usage Guidelines:</h2>
                      <p className="mb-4">
                        The lesson plans generated by our AI-powered generator
                        are designed to assist with your lesson planning
                        process. They are intended to provide you with
                        inspiration and ideas, but we cannot guarantee their
                        accuracy or suitability for your specific needs. Please
                        review and adjust the generated lesson plans to align
                        with your teaching style, class size, and student needs.
                      </p>
                      <p className="mb-4">
                        Mark Anthony Llego is not responsible for any errors,
                        omissions, or inaccuracies in the generated lesson
                        plans, nor for any consequences that may result from
                        their use. The generated lesson plans should be
                        considered as a starting point for your lesson planning,
                        and you are solely responsible for reviewing and
                        adapting them to fit your unique teaching situation.
                      </p>
                      <p className="mb-4">
                        By using Better Lessons, you agree to these usage
                        guidelines and acknowledge that the generated lesson
                        plans are not a substitute for your professional
                        judgment and experience as an educator.
                      </p>
                      <p className="mb-4">
                        The lesson plans are licensed under a{" "}
                        <a
                          href="https://creativecommons.org/licenses/by-nc-nd/4.0/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-bold text-blue-600 hover:text-blue-800"
                        >
                          Creative Commons
                          Attribution-NonCommercial-NoDerivatives 4.0
                          International License
                        </a>
                        . This means that users are free to share, copy, and
                        redistribute the material in any medium or format, as
                        long as they give appropriate credit to the creators, do
                        not use the material for commercial purposes, and do not
                        modify or adapt the material in any way.
                      </p>
                      <p>
                        In addition to these guidelines, users are granted a
                        creative license to use the generated reading passages
                        in their own unique and creative ways. However, users
                        should always respect the original intent and meaning of
                        the passages, and avoid using them in any way that could
                        be harmful, inappropriate, or unethical.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </ResizablePanel>
      </main>
      <Footer />
    </div>
  );
};

export default Home;