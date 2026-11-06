import { PrismaClient, QuestionDifficulty, TestCaseVisibility } from "../generated/client/index.js";

const prisma = new PrismaClient();
const V = TestCaseVisibility.VISIBLE;
const H = TestCaseVisibility.HIDDEN;

type Test = {
  input: Record<string, unknown>;
  expectedOutput: unknown;
  visibility?: TestCaseVisibility;
};
type SeedQuestion = {
  title: string;
  slug: string;
  description: string;
  difficulty: QuestionDifficulty;
  tags: string[];
  tests: Test[];
};

const tagSeeds = [
  ["Arrays", "arrays"],
  ["Strings", "strings"],
  ["Hash Table", "hash-table"],
  ["Two Pointers", "two-pointers"],
  ["Sliding Window", "sliding-window"],
  ["Binary Search", "binary-search"],
  ["Linked List", "linked-list"],
  ["Stack", "stack"],
  ["Trees", "trees"],
  ["Graphs", "graphs"],
  ["Dynamic Programming", "dynamic-programming"],
  ["Backtracking", "backtracking"],
  ["Sorting", "sorting"],
  ["Greedy", "greedy"],
  ["Math", "math"],
  ["Depth First Search", "depth-first-search"],
  ["Breadth First Search", "breadth-first-search"],
  ["Prefix Sum", "prefix-sum"],
];

const questions: SeedQuestion[] = [
  // 10 EASY
  {
    title: "Two Sum",
    slug: "two-sum",
    description:
      "Given an integer array nums and an integer target, return the indices of two distinct elements whose values add up to target. Exactly one solution exists. Return indices in any order.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "hash-table"],
    tests: [
      { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], visibility: V },
      { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], visibility: V },
      { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], visibility: H },
    ],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    description:
      "Given a string containing only (), {}, and [], determine whether brackets are correctly matched, closed, and nested.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["strings", "stack"],
    tests: [
      { input: { s: "()" }, expectedOutput: true, visibility: V },
      { input: { s: "()[]{}" }, expectedOutput: true, visibility: V },
      { input: { s: "(]" }, expectedOutput: false, visibility: H },
      { input: { s: "([{}])" }, expectedOutput: true, visibility: H },
    ],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    description:
      "Given prices[i] as the stock price on day i, choose one day to buy and a later day to sell. Return the maximum profit, or 0 if no profit is possible.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "greedy"],
    tests: [
      { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, visibility: V },
      { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, visibility: V },
      { input: { prices: [2, 4, 1] }, expectedOutput: 2, visibility: H },
    ],
  },
  {
    title: "Contains Duplicate",
    slug: "contains-duplicate",
    description:
      "Return true if an integer array contains any value at least twice; otherwise return false.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "hash-table"],
    tests: [
      { input: { nums: [1, 2, 3, 1] }, expectedOutput: true, visibility: V },
      { input: { nums: [1, 2, 3, 4] }, expectedOutput: false, visibility: V },
      { input: { nums: [] }, expectedOutput: false, visibility: H },
    ],
  },
  {
    title: "Valid Anagram",
    slug: "valid-anagram",
    description:
      "Given lowercase strings s and t, return true if t contains exactly the same characters with the same frequencies as s.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["strings", "hash-table", "sorting"],
    tests: [
      { input: { s: "anagram", t: "nagaram" }, expectedOutput: true, visibility: V },
      { input: { s: "rat", t: "car" }, expectedOutput: false, visibility: V },
      { input: { s: "ab", t: "a" }, expectedOutput: false, visibility: H },
    ],
  },
  {
    title: "Binary Search",
    slug: "binary-search",
    description:
      "Given a sorted array of distinct integers and a target, return the target's index or -1 if it is absent.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "binary-search"],
    tests: [
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: 4, visibility: V },
      { input: { nums: [-1, 0, 3, 5, 9, 12], target: 2 }, expectedOutput: -1, visibility: V },
      { input: { nums: [], target: 1 }, expectedOutput: -1, visibility: H },
    ],
  },
  {
    title: "Merge Sorted Array",
    slug: "merge-sorted-array",
    description:
      "Merge sorted nums2 into nums1, which has m valid elements followed by n spare slots. Return the merged sorted array.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "two-pointers", "sorting"],
    tests: [
      {
        input: { nums1: [1, 2, 3, 0, 0, 0], m: 3, nums2: [2, 5, 6], n: 3 },
        expectedOutput: [1, 2, 2, 3, 5, 6],
        visibility: V,
      },
      { input: { nums1: [1], m: 1, nums2: [], n: 0 }, expectedOutput: [1], visibility: V },
      { input: { nums1: [0], m: 0, nums2: [1], n: 1 }, expectedOutput: [1], visibility: H },
    ],
  },
  {
    title: "Palindrome Number",
    slug: "palindrome-number",
    description:
      "Return true if an integer reads the same forwards and backwards in decimal. Negative numbers are not palindromes.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["strings"],
    tests: [
      { input: { x: 121 }, expectedOutput: true, visibility: V },
      { input: { x: -121 }, expectedOutput: false, visibility: V },
      { input: { x: 10 }, expectedOutput: false, visibility: H },
    ],
  },
  {
    title: "Maximum Depth of Binary Tree",
    slug: "maximum-depth-of-binary-tree",
    description:
      "A binary tree is represented in level order, with null for missing nodes. Return the maximum number of nodes on a root-to-leaf path. Empty tree depth is 0.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["trees", "depth-first-search"],
    tests: [
      { input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: 3, visibility: V },
      { input: { root: [1, null, 2] }, expectedOutput: 2, visibility: V },
      { input: { root: [] }, expectedOutput: 0, visibility: H },
    ],
  },
  {
    title: "Move Zeroes",
    slug: "move-zeroes",
    description:
      "Move all zeroes to the end of nums while preserving the relative order of non-zero elements. Return the resulting array.",
    difficulty: QuestionDifficulty.EASY,
    tags: ["arrays", "two-pointers"],
    tests: [
      { input: { nums: [0, 1, 0, 3, 12] }, expectedOutput: [1, 3, 12, 0, 0], visibility: V },
      { input: { nums: [0] }, expectedOutput: [0], visibility: V },
      { input: { nums: [1, 2, 3] }, expectedOutput: [1, 2, 3], visibility: H },
    ],
  },
  // 7 MEDIUM
  {
    title: "Longest Substring Without Repeating Characters",
    slug: "longest-substring-without-repeating-characters",
    description:
      "Return the length of the longest substring of s that contains no repeated characters.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["strings", "sliding-window", "hash-table"],
    tests: [
      { input: { s: "abcabcbb" }, expectedOutput: 3, visibility: V },
      { input: { s: "bbbbb" }, expectedOutput: 1, visibility: V },
      { input: { s: "pwwkew" }, expectedOutput: 3, visibility: H },
      { input: { s: "" }, expectedOutput: 0, visibility: H },
    ],
  },
  {
    title: "3Sum",
    slug: "3sum",
    description:
      "Return all unique triplets in nums whose sum is zero. The result must not contain duplicate triplets; result order may vary.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["arrays", "two-pointers", "sorting"],
    tests: [
      {
        input: { nums: [-1, 0, 1, 2, -1, -4] },
        expectedOutput: [
          [-1, -1, 2],
          [-1, 0, 1],
        ],
        visibility: V,
      },
      { input: { nums: [0, 1, 1] }, expectedOutput: [], visibility: V },
      { input: { nums: [0, 0, 0] }, expectedOutput: [[0, 0, 0]], visibility: H },
    ],
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    description:
      "Return answer where answer[i] is the product of every nums element except nums[i]. Do not use division.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["arrays", "prefix-sum"],
    tests: [
      { input: { nums: [1, 2, 3, 4] }, expectedOutput: [24, 12, 8, 6], visibility: V },
      { input: { nums: [-1, 1, 0, -3, 3] }, expectedOutput: [0, 0, 9, 0, 0], visibility: V },
      { input: { nums: [2, 3] }, expectedOutput: [3, 2], visibility: H },
    ],
  },
  {
    title: "Group Anagrams",
    slug: "group-anagrams",
    description:
      "Group lowercase strings that are anagrams of one another. Groups and their internal order may vary.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["strings", "hash-table", "sorting"],
    tests: [
      {
        input: { strs: ["eat", "tea", "tan", "ate", "nat", "bat"] },
        expectedOutput: [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]],
        visibility: V,
      },
      { input: { strs: [""] }, expectedOutput: [[""]], visibility: V },
      { input: { strs: ["a"] }, expectedOutput: [["a"]], visibility: H },
    ],
  },
  {
    title: "Number of Islands",
    slug: "number-of-islands",
    description:
      "Count islands in a rectangular grid of '1' land and '0' water. Land connects horizontally and vertically, not diagonally.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["graphs", "depth-first-search", "breadth-first-search"],
    tests: [
      {
        input: {
          grid: [
            ["1", "1", "1", "1", "0"],
            ["1", "1", "0", "1", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "0", "0", "0"],
          ],
        },
        expectedOutput: 1,
        visibility: V,
      },
      {
        input: {
          grid: [
            ["1", "1", "0", "0", "0"],
            ["1", "1", "0", "0", "0"],
            ["0", "0", "1", "0", "0"],
            ["0", "0", "0", "1", "1"],
          ],
        },
        expectedOutput: 3,
        visibility: V,
      },
      { input: { grid: [["0"]] }, expectedOutput: 0, visibility: H },
    ],
  },
  {
    title: "Daily Temperatures",
    slug: "daily-temperatures",
    description:
      "For each day, return how many days until a warmer temperature; use 0 if there is no warmer future day.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["arrays", "stack"],
    tests: [
      {
        input: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] },
        expectedOutput: [1, 1, 4, 2, 1, 1, 0, 0],
        visibility: V,
      },
      { input: { temperatures: [30, 40, 50, 60] }, expectedOutput: [1, 1, 1, 0], visibility: V },
      { input: { temperatures: [30, 30, 30] }, expectedOutput: [0, 0, 0], visibility: H },
    ],
  },
  {
    title: "Coin Change",
    slug: "coin-change",
    description:
      "Given coin denominations and an amount, return the minimum number of coins needed. Return -1 if the amount cannot be made. Each denomination may be used repeatedly.",
    difficulty: QuestionDifficulty.MEDIUM,
    tags: ["dynamic-programming"],
    tests: [
      { input: { coins: [1, 2, 5], amount: 11 }, expectedOutput: 3, visibility: V },
      { input: { coins: [2], amount: 3 }, expectedOutput: -1, visibility: V },
      { input: { coins: [1], amount: 0 }, expectedOutput: 0, visibility: H },
    ],
  },
  // 3 HARD
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    description:
      "Given non-negative bar heights of width 1, return the total units of rain water that can be trapped.",
    difficulty: QuestionDifficulty.HARD,
    tags: ["arrays", "two-pointers", "dynamic-programming"],
    tests: [
      { input: { height: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] }, expectedOutput: 6, visibility: V },
      { input: { height: [4, 2, 0, 3, 2, 5] }, expectedOutput: 9, visibility: V },
      { input: { height: [1, 2, 3, 4] }, expectedOutput: 0, visibility: H },
    ],
  },
  {
    title: "Median of Two Sorted Arrays",
    slug: "median-of-two-sorted-arrays",
    description:
      "Given two sorted arrays, return the median of their combined sorted values. Aim for O(log(m+n)) time. At least one array is non-empty.",
    difficulty: QuestionDifficulty.HARD,
    tags: ["arrays", "binary-search"],
    tests: [
      { input: { nums1: [1, 3], nums2: [2] }, expectedOutput: 2, visibility: V },
      { input: { nums1: [1, 2], nums2: [3, 4] }, expectedOutput: 2.5, visibility: V },
      { input: { nums1: [], nums2: [1] }, expectedOutput: 1, visibility: H },
    ],
  },
  {
    title: "Longest Increasing Subsequence",
    slug: "longest-increasing-subsequence",
    description:
      "Return the length of the longest strictly increasing subsequence. The subsequence need not be contiguous.",
    difficulty: QuestionDifficulty.HARD,
    tags: ["arrays", "dynamic-programming", "binary-search"],
    tests: [
      { input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, expectedOutput: 4, visibility: V },
      { input: { nums: [0, 1, 0, 3, 2, 3] }, expectedOutput: 4, visibility: V },
      { input: { nums: [7, 7, 7, 7, 7] }, expectedOutput: 1, visibility: H },
    ],
  },
];

async function main() {
  if (questions.length !== 20) throw new Error(`Expected 20 questions, got ${questions.length}`);
  const counts = {
    easy: questions.filter((q) => q.difficulty === QuestionDifficulty.EASY).length,
    medium: questions.filter((q) => q.difficulty === QuestionDifficulty.MEDIUM).length,
    hard: questions.filter((q) => q.difficulty === QuestionDifficulty.HARD).length,
  };
  if (counts.easy !== 10 || counts.medium !== 7 || counts.hard !== 3) {
    throw new Error(`Unexpected difficulty distribution: ${JSON.stringify(counts)}`);
  }

  const user = await prisma.user.findFirst({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true },
  });
  if (!user)
    throw new Error("No User exists. Sign in/create a user first, then rerun this seed script.");
  console.log(`Using creator ${user.id} (${user.email})`);

  for (const [name, slug] of tagSeeds) {
    await prisma.tag.upsert({ where: { slug }, update: { name }, create: { name, slug } });
  }

  let totalTests = 0;
  for (const q of questions) {
    const question = await prisma.question.upsert({
      where: { slug: q.slug },
      update: {
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        tags: { deleteMany: {}, create: q.tags.map((slug) => ({ tag: { connect: { slug } } })) },
      },
      create: {
        title: q.title,
        slug: q.slug,
        description: q.description,
        difficulty: q.difficulty,
        createdById: user.id,
        tags: { create: q.tags.map((slug) => ({ tag: { connect: { slug } } })) },
      },
      select: { id: true, slug: true },
    });

    await prisma.testCase.deleteMany({ where: { questionId: question.id } });
    await prisma.testCase.createMany({
      data: q.tests.map((test) => ({
        questionId: question.id,
        input: test.input as any,
        expectedOutput: test.expectedOutput as any,
        visibility: test.visibility ?? H,
      })),
    });
    totalTests += q.tests.length;
    console.log(`✓ ${question.slug}: ${q.tests.length} test cases`);
  }

  console.log(
    `\nSeed complete: ${questions.length} questions (${counts.easy} easy, ${counts.medium} medium, ${counts.hard} hard), ${tagSeeds.length} tags, ${totalTests} test cases.`,
  );
}

main()
  .catch((error) => {
    console.error("Question seeding failed:", error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
