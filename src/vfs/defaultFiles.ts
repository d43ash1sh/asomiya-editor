import type { FileItem } from './types';

export const DEFAULT_FILES: Record<string, FileItem> = {
  'hello.asom': {
    id: 'hello.asom',
    name: 'hello.asom',
    path: 'hello.asom',
    type: 'file',
    content: `// নমস্কাৰ! প্ৰথম অসমীয়া প্ৰগ্ৰাম।
// Welcome to editor.asomiya.codes!

ধৰা ভাষা = "অসমীয়া"
ধৰা বৰ্ষ = ২০২৬
ধৰা বয়স = ২০

কোৱা("নমস্কাৰ, পৃথিৱী!")
কোৱা("এই প্ৰগ্ৰামটোৰ ভাষা: " + ভাষা + " (" + বৰ্ষ + ")")

যদি (বয়স >= ১৮) {
    কোৱা("স্থিতি: প্ৰাপ্তবয়স্ক (Adult)")
} নহ'লে {
    কোৱা("স্থিতি: অপ্ৰাপ্তবয়স্ক (Minor)")
}

// তালিকা আৰু গণনা
ধৰা সংখ্যাবোৰ = [১০, ২০, ৩০, ৪০, ৫০]
কোৱা("তালিকাৰ দৈৰ্ঘ্য:", দৈৰ্ঘ্য(সংখ্যাবোৰ))
কোৱা("প্ৰথম উপাদান:", সংখ্যাবোৰ[০])
`,
  },

  'roman.asom': {
    id: 'roman.asom',
    name: 'roman.asom',
    path: 'roman.asom',
    type: 'file',
    content: `// Romanized Assamese — You can write Assamese using English letters!
// Every keyword maps to both scripts: dhora = ধৰা, kowa = কোৱা, jodi = যদি ...

dhora naam = "Siddhartha"
dhora boyox = 24

kowa("Nomoskar, " + naam + "!")

jodi (boyox >= 18) {
    kowa("moi ejon praptoboyosko (I am an adult)")
} nohole {
    kowa("moi xoru (I am a minor)")
}

// Loop using jetialoike (যেতিয়ালৈকে)
dhora i = 1
dhora jugfol = 0

jetialoike (i <= 10) {
    jugfol = jugfol + i
    i = i + 1
}

kowa("1 pora 10 loike jugfol:", jugfol)

// Function definition using fangchon (ফাংচন)
fangchon borgo(x) {
    ghuraidiya x * x
}

kowa("borgo(12) =", borgo(12))
`,
  },

  'fibonacci.asom': {
    id: 'fibonacci.asom',
    name: 'fibonacci.asom',
    path: 'fibonacci.asom',
    type: 'file',
    content: `// ফাংচন আৰু ৰিকাৰচন (Functions & Recursion)
// ফিবোনাচ্চি ক্ৰম নিৰ্ণয়

ফাংচন ফিবোনাচ্চি(n) {
    যদি (n <= ১) {
        ঘূৰাইদিয়া n
    }
    ঘূৰাইদিয়া ফিবোনাচ্চি(n - ১) + ফিবোনাচ্চি(n - ২)
}

কোৱা("ফিবোনাচ্চি ফলাফলসমূহ:")
ধৰা পদ = ০
যেতিয়ালৈকে (পদ <= ১০) {
    কোৱা("পদ " + পদ + " = " + ফিবোনাচ্চি(পদ))
    পদ = পদ + ১
}
`,
  },

  'data_structures.asom': {
    id: 'data_structures.asom',
    name: 'data_structures.asom',
    path: 'data_structures.asom',
    type: 'file',
    content: `// তালিকা আৰু অন্তর্নিহিত ফাংচনসমূহ (Lists & Built-in functions)

ধৰা চহৰসমূহ = ["গুৱাহাটী", "যোৰহাট", "ডিব্ৰুগড়", "তেজপুৰ", "শিলচৰ"]
কোৱা("প্ৰাৰম্ভিক চহৰসমূহ:", চহৰসমূহ)
কোৱা("মুঠ সংখ্যা:", দৈৰ্ঘ্য(চহৰসমূহ))

// নতুন উপাদান যোগ (Push)
সংযোজন(চহৰসমূহ, "নগাঁও")
কোৱা("নগাঁও যোগ কৰাৰ পিছত:", চহৰসমূহ)

// শেষ উপাদান উলিওৱা (Pop)
ধৰা শেষ = উলিওৱা(চহৰসমূহ)
কোৱা("উলিওৱা চহৰ:", শেষ)

// ওলোটা কৰা (Reverse)
ধৰা ওলোটা_চহৰ = উল্টা(চহৰসমূহ)
কোৱা("ওলোটা ক্ৰমত:", ওলোটা_চহৰ)

// গণিত ফাংচনসমূহ
কোৱা("বৰ্গমূল(১৪৪):", বৰ্গমূল(১৪৪))
কোৱা("ঘাত(২, ৮):", ঘাত(২, ৮))
কোৱা("লঘিষ্ঠ মান:", লঘিষ্ঠ(৪৫, ১২, ৮৯, ৩, ৬৭))
কোৱা("গৰিষ্ঠ মান:", গৰিষ্ঠ(৪৫, ১২, ৮৯, ৩, ৬৭))
`,
  },

  'calculator.asom': {
    id: 'calculator.asom',
    name: 'calculator.asom',
    path: 'calculator.asom',
    type: 'file',
    content: `// ইন্টাৰেক্টিভ কেলকুলেটৰ (Interactive Calculator)
// ব্যৱহাৰকাৰীৰ পৰা সোধা() ৰ জৰিয়তে ইনপুট লয়

কোৱা("=== অসমীয়া ইন্টাৰেক্টিভ কেলকুলেটৰ ===")

ধৰা প্ৰথম_সংখ্যা_পাঠ = সোধা("প্ৰথম সংখ্যাটো লিখক: ")
ধৰা ক্ৰিয়া = সোধা("গণনা নিৰ্বাচন কৰক (+, -, *, /): ")
ধৰা দ্বিতীয়_সংখ্যা_পাঠ = সোধা("দ্বিতীয় সংখ্যাটো লিখক: ")

ধৰা ক = সংখ্যা(প্ৰথম_সংখ্যা_পাঠ)
ধৰা খ = সংখ্যা(দ্বিতীয়_সংখ্যা_পাঠ)

যদি (ক্ৰিয়া == "+") {
    কোৱা("ফলাফল: " + (ক + খ))
} নহ'লে যদি (ক্ৰিয়া == "-") {
    কোৱা("ফলাফল: " + (ক - খ))
} নহ'লে যদি (ক্ৰিয়া == "*") {
    কোৱা("ফলাফল: " + (ক * খ))
} নহ'লে যদি (ক্ৰিয়া == "/") {
    যদি (খ == ০) {
        কোৱা("ত্ৰুটি: ০ ৰে হৰণ কৰিব নোৱাৰি!")
    } নহ'লে {
        কোৱা("ফলাফল: " + (ক / খ))
    }
} নহ'লে {
    কোৱা("অজ্ঞাত ক্ৰিয়া: " + ক্ৰিয়া)
}
`,
  },

  'README.md': {
    id: 'README.md',
    name: 'README.md',
    path: 'README.md',
    type: 'file',
    content: `# Welcome to editor.asomiya.codes

The dedicated web-based development environment for **অসমীয়া (Asomiya)** programming language.

## Quick Shortcuts
- **Ctrl + Enter** / **Cmd + Enter**: Run the active file
- **Ctrl + S** / **Cmd + S**: Save changes
- **F1** / **Right Click**: Monaco Command Palette & formatting

## Features
- **Monaco Engine**: Powered by the same editor engine as VS Code (vscode.dev).
- **IntelliSense**: Autocomplete and hover docs for all Assamese and Romanized keywords.
- **Real-Time Diagnostics**: Inline error squiggles showing error codes with Assamese and English explanations.
- **Python Transpilation**: Instant view of your Asomiya code converted to Python.
- **Interactive Terminal**: Standard output streaming with support for \`সোধা()\` user input.
- **Project Export**: Export all files as a .zip or single file anytime.
`,
  },
};
