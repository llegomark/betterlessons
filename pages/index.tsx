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
  BackgroundKnowledgeType,
} from "../components/LessonPlanDropDown";
import { LessonPlanDropDown } from "../components/LessonPlanDropDown";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LoadingDots from "../components/LoadingDots";
import ResizablePanel from "../components/ResizablePanel";
import Balancer from "react-wrap-balancer";
import React from "react";
import SocialIcon from "../components/SocialIcon";

// This interface defines the types of data that the API response should have
// The 'status' field indicates the HTTP status code of the response
// The 'body' field is a string that contains the response body
// The 'headers' field contains various headers from the response
// The 'error' field is an optional string that contains an error message, in case the API call fails
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
  const [gradelevel, setGradelevel] = useState<GradelevelType>("Kindergarten");
  const [lessonPlanType, setLessonPlanType] = useState<LessonPlanType>(
    "Detailed Lesson Plan"
  );
  const [lessonDuration, setLessonDuration] =
    useState<LessonDurationType>("30-60 minutes");
  const [backgroundKnowledge, setBackgroundKnowledge] =
    useState<BackgroundKnowledgeType>("Beginner");
  const [generatedTopics, setGeneratedTopics] = useState<string>("");
  // This variable is used to generate the prompt for the user
  // The prompt varies depending on the user's input for 'topic', 'gradelevel', 'lessonPlanType', and 'lessonDuration'
  let prompt: string;
  if (topic.trim() === "") {
    prompt = `${
      lessonPlanType === "Detailed Lesson Plan"
        ? "Please create a complete and"
        : "Please create a"
    } ${lessonPlanType}, appropriate for ${gradelevel} students, that is ${lessonDuration} in duration. The student's background knowledge is at a ${backgroundKnowledge} level. Please include ${
      lessonPlanType === "Detailed Lesson Plan" ? "specific" : "general"
    } learning objectives that are achievable and measurable, a list of materials needed, and ${
      lessonPlanType === "Detailed Lesson Plan"
        ? "teaching strategies that engage students in the learning process, materials needed for the lesson, including any technology, books, or other resources that will be used, a detailed timeline for each activity, including estimated times for each part of the lesson, and assessment methods to evaluate student learning, such as quizzes, tests, or class participation. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan."
        : "a basic description of teaching strategies and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan."
    }`;
  } else {
    prompt = `${
      lessonPlanType === "Detailed Lesson Plan"
        ? "Please create a complete and"
        : "Please create a"
    } ${lessonPlanType} for a ${topic} lesson, appropriate for ${gradelevel} students, that is ${lessonDuration} in duration. The student's background knowledge is at a ${backgroundKnowledge} level. Please include ${
      lessonPlanType === "Detailed Lesson Plan" ? "specific" : "general"
    } learning objectives that are achievable and measurable, ${
      lessonPlanType === "Detailed Lesson Plan"
        ? "teaching strategies that engage students in the learning process, materials needed for the lesson, including any technology, books, or other resources that will be used, a detailed timeline for each activity, including estimated times for each part of the lesson, and assessment methods to evaluate student learning, such as quizzes, tests, or class participation. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan."
        : "a basic description of teaching strategies and assessment methods. Please draw on your expertise in teaching experience in the subject area to create an effective and engaging lesson plan."
    }`;
  }

  // This function is called when the user submits the form
  // It calls the 'generateTopic' function to send a POST request to the API and update the 'generatedTopics' state
  // If there is an error with the API call, it shows an alert to the user
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    generateTopic().catch((error) => {
      // Handle errors here
      console.error(error);
      alert("An error occurred. Please try again.");
    });
  };
  // This function sends a POST request to the API with the provided prompt
  // It reads the response body as a stream and updates the 'generatedTopics' state with each chunk of data
  // If there is an error with the API call, it sets the 'response' state and shows an alert to the user
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

  // This variable is an array of strings that represents the generated topics
  // It is created by splitting the 'generatedTopics' state by the newline character
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
          aria-label="Lesson Planning"
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
              aria-label="Please input your desired topic or subject. If you leave the field blank, a random lesson will be generated."
            />
            <p className="mt-2 text-right text-sm text-gray-500">
              {topic.length}/200
            </p>
            <div className="align-items-center mt-10 flex items-center">
              <span className="leading-zero flex h-6 w-6 items-center justify-center rounded-full bg-black p-2 text-center text-white">
                2
              </span>
              <p className="ml-3 text-left text-base leading-normal text-slate-900 sm:text-lg lg:text-lg">
                <Balancer>
                  Please choose a grade/college level for the lesson.
                </Balancer>
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
                  Please indicate your preferred level of detail and duration
                  for the lesson, and share your student background knowledge on
                  the topic.
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
                backgroundKnowledge={backgroundKnowledge}
                setBackgroundKnowledge={(newBackgroundKnowledge) =>
                  setBackgroundKnowledge(newBackgroundKnowledge)
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
          position="bottom-right"
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
                        const plan = `\nBy: Mark Anthony Llego \n\n${generatedTopics}`;
                        navigator.clipboard
                          .writeText(plan)
                          .then(() => {
                            toast.success("Generated Lesson Plan Copied", {});
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
                        creative license to use the generated lesson plans in
                        their own unique and creative ways. However, users
                        should always respect the original intent and meaning of
                        the lesson plan, and avoid using them in any way that
                        could be harmful, inappropriate, or unethical.
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
