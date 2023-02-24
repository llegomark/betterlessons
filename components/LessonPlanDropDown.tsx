import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/20/solid";
import { Fragment } from "react";

export type LessonPlanType =
  | "Detailed Lesson Plan"
  | "Semi-Detailed Lesson Plan";
export type LessonDurationType =
  | "30-60 minutes"
  | "60-90 minutes"
  | "90-120 minutes"
  | "2-3 hours";

interface LessonPlanDropDownProps {
  lessonPlanType: LessonPlanType;
  setLessonPlanType: (lessonPlanType: LessonPlanType) => void;
  lessonDuration: LessonDurationType;
  setLessonDuration: (lessonDuration: LessonDurationType) => void;
}

export const LessonPlanDropDown: React.FC<LessonPlanDropDownProps> = ({
  lessonPlanType,
  setLessonPlanType,
  lessonDuration,
  setLessonDuration,
}) => {
  const lessonPlanTypes: LessonPlanType[] = [
    "Detailed Lesson Plan",
    "Semi-Detailed Lesson Plan",
  ];
  const lessonDurationTypes: LessonDurationType[] = [
    "30-60 minutes",
    "60-90 minutes",
    "90-120 minutes",
    "2-3 hours",
  ];

  return (
    <div className="space-y-2">
      <div>
        <Menu
          as="div"
          className="relative block w-full text-left"
          key={`dropdown-${lessonPlanType}-${Math.random()}`}
        >
          <div>
            <Menu.Button className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black">
              {lessonPlanType}
              <ChevronUpIcon
                className="-mr-1 ml-2 h-5 w-5 ui-open:hidden"
                aria-hidden="true"
              />
              <ChevronDownIcon
                className="-mr-1 ml-2 hidden h-5 w-5 ui-open:block"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="h-32 overflow-y-scroll">
                {lessonPlanTypes.map((lessonPlanTypeItem) => (
                  <Menu.Item key={lessonPlanTypeItem}>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() => setLessonPlanType(lessonPlanTypeItem)}
                        className={`flex w-full items-center justify-between space-x-2 px-4 py-2 text-left text-sm ${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } ${
                          lessonPlanType === lessonPlanTypeItem
                            ? "bg-gray-200"
                            : ""
                        }`}
                      >
                        <span>{lessonPlanTypeItem}</span>
                        {lessonPlanType === lessonPlanTypeItem ? (
                          <CheckIcon className="text-bold h-4 w-4" />
                        ) : null}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
      <div>
        <Menu
          as="div"
          className="relative block w-full text-left"
          key={`dropdown-${lessonDuration}-${Math.random()}`}
        >
          <div>
            <Menu.Button className="inline-flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black">
              {lessonDuration}
              <ChevronUpIcon
                className="-mr-1 ml-2 h-5 w-5 ui-open:hidden"
                aria-hidden="true"
              />
              <ChevronDownIcon
                className="-mr-1 ml-2 hidden h-5 w-5 ui-open:block"
                aria-hidden="true"
              />
            </Menu.Button>
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="h-32 overflow-y-scroll">
                {lessonDurationTypes.map((lessonDurationTypeItem) => (
                  <Menu.Item key={lessonDurationTypeItem}>
                    {({ active }: { active: boolean }) => (
                      <button
                        onClick={() =>
                          setLessonDuration(lessonDurationTypeItem)
                        }
                        className={`flex w-full items-center justify-between space-x-2 px-4 py-2 text-left text-sm ${
                          active ? "bg-gray-100 text-gray-900" : "text-gray-700"
                        } ${
                          lessonDuration === lessonDurationTypeItem
                            ? "bg-gray-200"
                            : ""
                        }`}
                      >
                        <span>{lessonDurationTypeItem}</span>
                        {lessonDuration === lessonDurationTypeItem ? (
                          <CheckIcon className="text-bold h-4 w-4" />
                        ) : null}
                      </button>
                    )}
                  </Menu.Item>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </div>
  );
};
