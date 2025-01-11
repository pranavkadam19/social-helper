import {
  FaYoutube,
  FaInstagram,
  FaReddit,
  FaLinkedin,
  FaTwitch,
} from "react-icons/fa";
import { FaSquareThreads } from "react-icons/fa6";
export const contentTemplates = [
  {
    name: "Youtube Video Description",
    desc: "An AI tool that generate youtube video description from your information",
    category: "Youtube",
    icon: FaYoutube,
    aiPrompt:
      "Give me youtube video description Ideas based on given video description outline and title and give me result in Rich Text Editor format",
    slug: "Youtube-Video-Description",
    form: [
      {
        label: "Youtube Video Description Title",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter Video Description Outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
  {
    name: "Twitch Streaming Ideas",
    desc: "An AI tool that generate Twicth Streaming Idea based on given information",
    category: "Twitch",
    icon: FaTwitch,
    aiPrompt:
      "Give me Twitch stream idea on given video niche & outline topic and give me result in Rich Text Editor format",
    slug: "Twitch-Streaming-Ideas",
    form: [
      {
        label: "Enter your video niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter video outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
  {
    name: "Instagram Captions",
    desc: "An AI tool that generate Instagram Captions based on your post niche and outline information",
    category: "Instagram",
    icon: FaInstagram,
    aiPrompt:
      "Give me some good examples of instagram captions on given niche & outline topic and give me result in Rich Text Editor format",
    slug: "Instagram-Captions",
    form: [
      {
        label: "Enter your post niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter post outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
  {
    name: "Reddit Post Ideas",
    desc: "An AI tool that generate Reddit post idea based on your post niche and outline information",
    category: "Reddit",
    icon: FaReddit,
    aiPrompt:
      "Give me some good examples of Reddit post idea on given niche & outline topic and give me result in Rich Text Editor format",
    slug: "Reddit-Post-Ideas",
    form: [
      {
        label: "Enter your post niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter post outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
  {
    name: "Linkedin Post",
    desc: "An AI tool that generate Linkedin Post idea based on your post niche and outline information",
    category: "Linkedin",
    icon: FaLinkedin,
    aiPrompt:
      "Give me some good examples of Linkedin Post idea on given niche & outline topic and give me result in Rich Text Editor format",
    slug: "Linkedin-Post",
    form: [
      {
        label: "Enter your post niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter post outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
  {
    name: "Threads",
    desc: "An AI tool that generate Threads for Tweeter or X based on your post niche and outline information",
    category: "Threads",
    icon: FaSquareThreads,
    aiPrompt:
      "Give me 280 characters of tweet example on given niche & outline topic",
    slug: "Threads",
    form: [
      {
        label: "Enter your tweet niche",
        field: "input",
        name: "niche",
        required: true,
      },
      {
        label: "Enter tweet outline",
        field: "textarea",
        name: "outline",
      },
    ],
  },
];
