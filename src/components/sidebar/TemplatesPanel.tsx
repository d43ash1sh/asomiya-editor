import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface TemplateItem {
  id: string;
  name: string;
  category: string;
  desc: string;
  filename: string;
  code: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'prime_sieve',
    name: 'মৌলিক সংখ্যা (Prime Numbers)',
    category: 'Algorithms',
    desc: 'প্ৰদত্ত পৰিসৰৰ ভিতৰত মৌলিক সংখ্যা নিৰ্ণয়।',
    filename: 'prime_numbers.asom',
    code: `// ১ ৰ পৰা ৫০ লৈকে মৌলিক সংখ্যা নিৰ্ণয়
ফাংচন মৌলিক_হয়_নে(সংখ্যা) {
    যদি (সংখ্যা <= ১) {
        ঘূৰাইদিয়া মিছা
    }
    ধৰা i = ২
    যেতিয়ালৈকে (i * i <= সংখ্যা) {
        যদি (সংখ্যা % i == ০) {
            ঘূৰাইদিয়া মিছা
        }
        i = i + ১
    }
    ঘূৰাইদিয়া সঁচা
}

কোৱা("১ ৰ পৰা ৫০ লৈকে মৌলিক সংখ্যাসমূহ:")
ধৰা n = ১
যেতিয়ালৈকে (n <= ৫০) {
    যদি (মৌলিক_হয়_নে(n)) {
        কোৱা("মৌলিক:", n)
    }
    n = n + ১
}
`,
  },
  {
    id: 'bubble_sort',
    name: 'বাবল চৰ্ট (Bubble Sort)',
    category: 'Algorithms',
    desc: 'তালিকা ক্ৰমানুসাৰে সজোৱা (Sorting a list).',
    filename: 'bubble_sort.asom',
    code: `// বাবল চৰ্ট এলগৰিদম
ধৰা সংখ্যাবোৰ = [৬৪, ৩৪, ২৫, ১২, ২২, ১১, ৯০]
কোৱা("পূৰ্বৰ তালিকা:", সংখ্যাবোৰ)

ধৰা মুঠ = দৈৰ্ঘ্য(সংখ্যাবোৰ)
ধৰা i = ০
যেতিয়ালৈকে (i < মুঠ - ১) {
    ধৰা j = ০
    যেতিয়ালৈকে (j < মুঠ - i - ১) {
        যদি (সংখ্যাবোৰ[j] > সংখ্যাবোৰ[j + ১]) {
            // অদল-বদল
            ধৰা অস্থায়ী = সংখ্যাবোৰ[j]
            সংখ্যাবোৰ[j] = সংখ্যাবোৰ[j + ১]
            সংখ্যাবোৰ[j + ১] = অস্থায়ী
        }
        j = j + ১
    }
    i = i + ১
}

কোৱা("সজোৱাৰ পিছৰ তালিকা:", সংখ্যাবোৰ)
`,
  },
  {
    id: 'roman_loop',
    name: 'Romanized Factorial & Math',
    category: 'Roman Script',
    desc: 'Romanized Assamese factorial calculation with while loop.',
    filename: 'roman_math.asom',
    code: `// Factorial using Romanized Assamese
fangchon factorial(n) {
    jodi (n <= 1) {
        ghuraidiya 1
    }
    ghuraidiya n * factorial(n - 1)
}

dhora x = 1
jetialoike (x <= 7) {
    kowa(x + " factorial = " + factorial(x))
    x = x + 1
}
`,
  },
  {
    id: 'string_manipulation',
    name: 'শব্দ আৰু আখৰ (String & Text)',
    category: 'Text Processing',
    desc: 'Assamese Unicode grapheme manipulation and reverse.',
    filename: 'text_processing.asom',
    code: `// পাঠ আৰু আখৰৰ ব্যৱহাৰ
ধৰা বাক্য = "অসম আমাৰ ৰূপহী"
কোৱা("মূল বাক্য:", বাক্য)
কোৱা("আখৰৰ দৈৰ্ঘ্য:", দৈৰ্ঘ্য(বাক্য))

ধৰা ওলোটা = উল্টা(বাক্য)
কোৱা("ওলোটা বাক্য:", ওলোটা)

// পাঠৰ অংশ কটা
ধৰা প্ৰথম_শব্দ = কটা(বাক্য, ০, ৩)
কোৱা("প্ৰথম অংশ:", প্ৰথম_শব্দ)
`,
  },
];

interface TemplatesPanelProps {
  createFile: (name: string, content: string) => void;
}

export const TemplatesPanel: React.FC<TemplatesPanelProps> = ({ createFile }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '8px 12px' }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          color: 'var(--vscode-text-muted)',
          marginBottom: 10,
        }}
      >
        ALGORITHM & TEMPLATE EXAMPLES
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TEMPLATES.map((tmpl) => (
          <div
            key={tmpl.id}
            style={{
              padding: 10,
              backgroundColor: 'var(--vscode-hover)',
              borderRadius: 4,
              border: '1px solid var(--vscode-border)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--vscode-text-bright)' }}>
                {tmpl.name}
              </span>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 6px',
                  backgroundColor: 'var(--vscode-badge-bg)',
                  borderRadius: 8,
                }}
              >
                {tmpl.category}
              </span>
            </div>

            <div style={{ fontSize: 12, color: 'var(--vscode-text-muted)', marginTop: 4, marginBottom: 8 }}>
              {tmpl.desc}
            </div>

            <button
              onClick={() => createFile(tmpl.filename, tmpl.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                backgroundColor: 'var(--vscode-button-bg)',
                color: '#ffffff',
                borderRadius: 2,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              <Sparkles size={12} />
              <span>Load into Workspace</span>
              <ArrowRight size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
