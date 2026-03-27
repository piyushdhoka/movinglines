'use client'

import { FAQ } from '@/components/ui/faq-tabs'

const categories = {
  general: 'General',
  creation: 'Creating Animations',
  technical: 'Technical',
  pricing: 'Pricing & Plans',
}

const faqData = {
  general: [
    {
      question: 'What is MovingLines?',
      answer:
        'MovingLines is an AI-powered platform that turns natural language prompts into high-quality Manim animations. Describe a math concept and our engine generates production-ready video.',
    },
    {
      question: 'Who is MovingLines built for?',
      answer:
        'Educators, content creators, developers, and anyone who needs to visualize mathematical or scientific concepts without writing Manim code from scratch.',
    },
    {
      question: 'Do I need to know Manim or Python?',
      answer:
        'No. MovingLines handles the code generation for you. Just describe what you want to visualize in plain English, and the AI takes care of the rest.',
    },
    {
      question: 'What kind of animations can I create?',
      answer:
        'Anything Manim supports — from calculus graphs and geometric transformations to physics simulations, linear algebra visualizations, and more.',
    },
  ],
  creation: [
    {
      question: 'How do I create an animation?',
      answer:
        'Type a prompt describing the math concept you want to visualize in the editor, click Generate, and MovingLines produces the Manim code and renders the animation for you.',
    },
    {
      question: 'Can I edit the generated code?',
      answer:
        'Yes. The generated Manim code is fully editable. You can tweak timings, colors, camera angles, and any other parameter before re-rendering.',
    },
    {
      question: 'What output formats are supported?',
      answer:
        'MovingLines supports MP4 (up to 4K), GIF, and individual PNG frames — ready for presentations, social media, or embedding in documentation.',
    },
    {
      question: 'How long does rendering take?',
      answer:
        'Most animations render in under 30 seconds. Complex scenes with many objects or high resolution may take a bit longer.',
    },
  ],
  technical: [
    {
      question: 'What version of Manim is used?',
      answer:
        'MovingLines uses Manim Community Edition (ManimCE) — the actively maintained, community-driven fork of the original 3Blue1Brown library.',
    },
    {
      question: 'Is my data and code private?',
      answer:
        'Yes. Your prompts, generated code, and rendered animations are private to your account. We do not share or use your content for training.',
    },
    {
      question: 'Can I use MovingLines with my own Manim scenes?',
      answer:
        'Yes. You can paste existing Manim code into the editor, run it through our cloud renderer, and iterate on it with AI assistance.',
    },
    {
      question: 'What browsers are supported?',
      answer:
        'MovingLines works in all modern browsers — Chrome, Firefox, Safari, and Edge. We recommend Chrome for the best experience.',
    },
  ],
  pricing: [
    {
      question: 'Is MovingLines free to use?',
      answer:
        'Yes. We offer a free tier with 2 generation credits. This lets you try the full pipeline before committing to a paid plan.',
    },
    {
      question: 'What happens when I run out of credits?',
      answer:
        'You can upgrade to a paid plan for more credits, or wait for your free credits to refresh. We will never lock you out of your existing work.',
    },
    {
      question: 'Do you offer team or education plans?',
      answer:
        'We\'re working on team plans and special pricing for educators. Reach out to us on LinkedIn if you\'re interested in early access.',
    },
    {
      question: 'Can I cancel anytime?',
      answer:
        'Yes. All paid plans are month-to-month with no long-term commitment. Cancel anytime from your account settings.',
    },
  ],
}

export function FAQSection() {
  return (
    <FAQ
      title="Frequently Asked Questions"
      subtitle="Got questions?"
      categories={categories}
      faqData={faqData}
    />
  )
}
