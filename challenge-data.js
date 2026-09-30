// Ratings reflect this site's versions of the problems, on a 1–5 scale.
export const ratings = {
  'Pair Sum':1,'Reverse Words':1,'First Unique Character':1,'Running Sum':1,'Valid Palindrome':1,'Missing Number':1,
  'Best Stock Trade':2,'Anagram Check':1,'Move Zeroes':2,'Majority Element':2,'Intersection with Multiplicity':2,'Longest Common Prefix':1,
  'Longest Distinct Window':3,'Product Except Self':3,'Subarray Sum Count':3,'Group Anagrams':2,'Minimum Window Sum':3,'Rotate Array':2,
  'Balanced Brackets':2,'Search Insert Position':2,'Daily Temperatures':3,'Merge Intervals':3,'Peak in Mountain':2,'Next Greater Element':3,
  'Climbing Steps':2,'House Robber':3,'Coin Change':4,'Longest Increasing Subsequence':4,'Unique Grid Paths':3,'Decode Digits':3,
  'Number of Islands':4,'Course Schedule':4,'Kth Largest':4,'Matrix Distance':4,'Partition Equal Sum':4,'Shortest Grid Route':4,
  'Median of Two Sorted Arrays':5,'Regular Expression Match':5,'Word Ladder':5,'Trapping Rain Water':5,'Edit Distance':5,'Largest Rectangle in Histogram':5
};

// Official problem slugs for the inspirations recorded in contracts.js.
export const leetcodeSlugs = {
  1:'two-sum',3:'longest-substring-without-repeating-characters',4:'median-of-two-sorted-arrays',10:'regular-expression-matching',14:'longest-common-prefix',20:'valid-parentheses',35:'search-insert-position',42:'trapping-rain-water',49:'group-anagrams',56:'merge-intervals',62:'unique-paths',70:'climbing-stairs',72:'edit-distance',84:'largest-rectangle-in-histogram',91:'decode-ways',121:'best-time-to-buy-and-sell-stock',125:'valid-palindrome',127:'word-ladder',151:'reverse-words-in-a-string',169:'majority-element',189:'rotate-array',198:'house-robber',200:'number-of-islands',207:'course-schedule',209:'minimum-size-subarray-sum',215:'kth-largest-element-in-an-array',238:'product-of-array-except-self',242:'valid-anagram',268:'missing-number',283:'move-zeroes',300:'longest-increasing-subsequence',322:'coin-change',350:'intersection-of-two-arrays-ii',387:'first-unique-character-in-a-string',416:'partition-equal-subset-sum',542:'01-matrix',560:'subarray-sum-equals-k',739:'daily-temperatures',852:'peak-index-in-a-mountain-array',1480:'running-sum-of-1d-array'
};
export const leetcodeUrl = id => leetcodeSlugs[id] ? `https://leetcode.com/problems/${leetcodeSlugs[id]}/` : null;

const repeat = (value,length) => ({kind:'repeat',value,length});
const sequence = (start,step,length) => ({kind:'sequence',start,step,length});
const size = 50000;
const timed = (args,expected) => ({args,expected,budgetMs:1200});
const performance = {
  'Pair Sum':timed([sequence(0,1,size),99997],[49998,49999]),
  'Product Except Self':timed([repeat(0,size)],repeat(0,size)),
  'Subarray Sum Count':timed([repeat(0,size),1],0),
  'Minimum Window Sum':timed([size,repeat(1,size)],size),
  'Daily Temperatures':timed([repeat(70,size)],repeat(0,size)),
  'Longest Increasing Subsequence':timed([sequence(size,-1,size)],1),
  'Largest Rectangle in Histogram':timed([repeat(1,size)],size)
};
export const performanceCase = problem => performance[problem.title] || null;
