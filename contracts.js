// Function contracts for the original adaptations in problems.js.
const nums = s => s.trim() ? s.trim().split(/\s+/).map(Number) : [];
const lines = s => s.split('\n');
const pair = s => { const [a,b] = lines(s); return [nums(a), Number(b)]; };
const rows = s => lines(s).filter(Boolean).map(nums);
const grid = s => lines(s).slice(1);
const matrix = s => lines(s).slice(1).map(nums);
const bool = s => s === 'true';
const outNums = nums;
const outRows = rows;
const words = s => s.trim() ? s.trim().split(/\s+/) : [];
const byLines = s => lines(s).filter(Boolean);
const spec = (name, params, parse, expected, source) => ({ name, params, parse, expected, source });
// Types: n number, f floating point, s string, b boolean, N int array,
// S string array, M int matrix, G string matrix.
export const contracts = {
  'Pair Sum': spec('twoSum',[['nums','N'],['target','n']],pair,outNums,1),
  'Reverse Words': spec('reverseWords',[['text','s']],s=>[s],s=>s,151),
  'First Unique Character': spec('firstUniqueChar',[['text','s']],s=>[s],Number,387),
  'Running Sum': spec('runningSum',[['nums','N']],s=>[nums(s)],outNums,1480),
  'Valid Palindrome': spec('isPalindrome',[['text','s']],s=>[s],bool,125),
  'Missing Number': spec('missingNumber',[['nums','N']],s=>[nums(s)],Number,268),
  'Best Stock Trade': spec('maxProfit',[['prices','N']],s=>[nums(s)],Number,121),
  'Anagram Check': spec('isAnagram',[['first','s'],['second','s']],lines,bool,242),
  'Move Zeroes': spec('moveZeroes',[['nums','N']],s=>[nums(s)],outNums,283),
  'Majority Element': spec('majorityElement',[['nums','N']],s=>[nums(s)],Number,169),
  'Intersection with Multiplicity': spec('intersect',[['first','N'],['second','N']],s=>lines(s).map(nums),outNums,350),
  'Longest Common Prefix': spec('longestCommonPrefix',[['words','S']],s=>[byLines(s)],s=>s,14),
  'Longest Distinct Window': spec('lengthOfLongestSubstring',[['text','s']],s=>[s],Number,3),
  'Product Except Self': spec('productExceptSelf',[['nums','N']],s=>[nums(s)],outNums,238),
  'Subarray Sum Count': spec('subarraySum',[['nums','N'],['target','n']],pair,Number,560),
  'Group Anagrams': spec('groupAnagrams',[['words','S']],s=>[words(s)],s=>byLines(s).map(words),'49'),
  'Minimum Window Sum': spec('minSubArrayLen',[['target','n'],['nums','N']],s=>{const [a,b]=pair(s);return [b,a]},Number,209),
  'Rotate Array': spec('rotateArray',[['nums','N'],['steps','n']],pair,outNums,189),
  'Balanced Brackets': spec('isValid',[['brackets','s']],s=>[s],bool,20),
  'Search Insert Position': spec('searchInsert',[['nums','N'],['target','n']],pair,Number,35),
  'Daily Temperatures': spec('dailyTemperatures',[['temperatures','N']],s=>[nums(s)],outNums,739),
  'Merge Intervals': spec('mergeIntervals',[['intervals','M']],s=>[rows(s)],outRows,56),
  'Peak in Mountain': spec('peakIndexInMountainArray',[['nums','N']],s=>[nums(s)],Number,852),
  'Next Greater Element': spec('nextGreaterElements',[['nums','N']],s=>[nums(s)],outNums,null),
  'Climbing Steps': spec('climbStairs',[['steps','n']],s=>[Number(s)],Number,70),
  'House Robber': spec('rob',[['houses','N']],s=>[nums(s)],Number,198),
  'Coin Change': spec('coinChange',[['coins','N'],['amount','n']],pair,Number,322),
  'Longest Increasing Subsequence': spec('lengthOfLIS',[['nums','N']],s=>[nums(s)],Number,300),
  'Unique Grid Paths': spec('uniquePaths',[['rows','n'],['columns','n']],s=>nums(s),Number,62),
  'Decode Digits': spec('numDecodings',[['digits','s']],s=>[s],Number,91),
  'Number of Islands': spec('numIslands',[['grid','S']],s=>[grid(s)],Number,200),
  'Course Schedule': spec('canFinish',[['count','n'],['prerequisites','M']],s=>{const [n,...p]=lines(s);return [Number(n),p.filter(Boolean).map(nums)]},bool,207),
  'Kth Largest': spec('findKthLargest',[['nums','N'],['k','n']],pair,Number,215),
  'Matrix Distance': spec('updateMatrix',[['matrix','M']],s=>[matrix(s)],outRows,542),
  'Partition Equal Sum': spec('canPartition',[['nums','N']],s=>[nums(s)],bool,416),
  'Shortest Grid Route': spec('shortestRoute',[['grid','S']],s=>[grid(s)],Number,null),
  'Median of Two Sorted Arrays': spec('findMedianSortedArrays',[['first','N'],['second','N']],s=>lines(s).map(nums),Number,4),
  'Regular Expression Match': spec('isMatch',[['text','s'],['pattern','s']],lines,bool,10),
  'Word Ladder': spec('ladderLength',[['start','s'],['end','s'],['words','S']],s=>{const [a,b,...rest]=lines(s);return [a,b,rest.filter(Boolean)]},Number,127),
  'Trapping Rain Water': spec('trap',[['heights','N']],s=>[nums(s)],Number,42),
  'Edit Distance': spec('minDistance',[['first','s'],['second','s']],lines,Number,72),
  'Largest Rectangle in Histogram': spec('largestRectangleArea',[['heights','N']],s=>[nums(s)],Number,84),
};
export function typedCases(problem) {
  const contract = contracts[problem.title];
  return problem.cases.map(c => ({ args: contract.parse(c.stdin), expected: contract.expected(c.expected) }));
}
