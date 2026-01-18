-- Add is_premium column if it doesn't exist
ALTER TABLE dsa_problems ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT FALSE;

-- Clear previous entries for these slugs to avoid duplicates (optional, but safer for re-running)
DELETE FROM dsa_problems WHERE slug IN ('merge-sorted-array', 'best-time-to-buy-and-sell-stock', 'remove-duplicates-from-sorted-array', '3sum', 'product-of-array-except-self', 'group-anagrams', 'trapping-rain-water', 'median-of-two-sorted-arrays', 'merge-k-sorted-lists', 'climbing-stairs', 'single-number', 'longest-palindromic-substring', 'container-with-most-water', 'edit-distance', 'largest-rectangle-in-histogram');

-- Insert Problems
INSERT INTO dsa_problems (
    slug, title, description, difficulty, acceptance_rate, 
    total_accepted, total_submissions, test_cases, 
    template_js, template_cpp, hints, tags, companies, is_premium
) VALUES 
(
    'merge-sorted-array', 
    'Merge Sorted Array', 
    'You are given two integer arrays nums1 and nums2, sorted in non-decreasing order, and two integers m and n, representing the number of elements in nums1 and nums2 respectively.

Merge nums1 and nums2 into a single array sorted in non-decreasing order.

The final sorted array should not be returned by the function, but instead be stored inside the array nums1. To accommodate this, nums1 has a length of m + n, where the first m elements denote the elements that should be merged, and the last n elements are set to 0 and should be ignored. nums2 has a length of n.

Examples
Input: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
Output: [1,2,2,3,5,6]
Explanation: The arrays we are merging are [1,2,3] and [2,5,6].
The result of the merge is [1,2,2,3,5,6] with the underlined elements coming from nums1.

Input: nums1 = [1], m = 1, nums2 = [], n = 0
Output: [1]
Explanation: The arrays we are merging are [1] and [].
The result of the merge is [1].

Input: nums1 = [0], m = 0, nums2 = [1], n = 1
Output: [1]
Explanation: The arrays we are merging are [] and [1].
The result of the merge is [1].
Note that because m = 0, there are no elements in nums1. The 0 is only there to ensure the merge result can fit in nums1.

Constraints
• nums1.length == m + n
• nums2.length == n
• 0 <= m, n <= 200
• 1 <= m + n <= 200
• -10^9 <= nums1[i], nums2[j] <= 10^9', 
    'Easy', 
    '53.0', -- Random acceptance rate 30-70%
    85, -- Total accepted
    1216, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums1
 * @param {number} m
 * @param {number[]} nums2
 * @param {number} n
 * @return {void} Do not return anything, modify nums1 in-place.
 */
var merge = function(nums1, m, nums2, n) {
    
};', 
    'class Solution {
public:
    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Two Pointers","Sorting"}', 
    '{"Facebook","Microsoft","Amazon"}',
    false
),
(
    'best-time-to-buy-and-sell-stock', 
    'Best Time to Buy and Sell Stock', 
    'You are given an array prices where prices[i] is the price of a given stock on the ith day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.

Examples
Input: prices = [7,1,5,3,6,4]
Output: 5
Explanation: Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.
Note that buying on day 2 and selling on day 1 is not allowed because you must buy before you sell.

Input: prices = [7,6,4,3,1]
Output: 0
Explanation: In this case, no transactions are done and the max profit = 0.

Constraints
• 1 <= prices.length <= 10^5
• 0 <= prices[i] <= 10^4', 
    'Easy', 
    '47.3', -- Random acceptance rate 30-70%
    342, -- Total accepted
    923, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} prices
 * @return {number}
 */
var maxProfit = function(prices) {
    
};', 
    'class Solution {
public:
    int maxProfit(vector<int>& prices) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Dynamic Programming"}', 
    '{"Amazon","Google","Facebook"}',
    false
),
(
    'remove-duplicates-from-sorted-array', 
    'Remove Duplicates from Sorted Array', 
    'Given an integer array nums sorted in non-decreasing order, remove the duplicates in-place such that each unique element appears only once. The relative order of the elements should be kept the same.

Since it is impossible to change the length of the array in some languages, you must instead have the result be placed in the first part of the array nums. More formally, if there are k elements after removing the duplicates, then the first k elements of nums should hold the final result. It does not matter what you leave beyond the first k elements.

Return k after placing the final result in the first k slots of nums.

Do not allocate extra space for another array. You must do this by modifying the input array in-place with O(1) extra memory.

Examples
Input: nums = [1,1,2]
Output: 2, nums = [1,2,_]
Explanation: Your function should return k = 2, with the first two elements of nums being 1 and 2 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

Input: nums = [0,0,1,1,1,2,2,3,3,4]
Output: 5, nums = [0,1,2,3,4,_,_,_,_,_]
Explanation: Your function should return k = 5, with the first five elements of nums being 0, 1, 2, 3, and 4 respectively.
It does not matter what you leave beyond the returned k (hence they are underscores).

Constraints
• 1 <= nums.length <= 3 * 10^4
• -100 <= nums[i] <= 100
• nums is sorted in non-decreasing order.', 
    'Easy', 
    '65.9', -- Random acceptance rate 30-70%
    140, -- Total accepted
    939, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums
 * @return {number}
 */
var removeDuplicates = function(nums) {
    
};', 
    'class Solution {
public:
    int removeDuplicates(vector<int>& nums) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Two Pointers"}', 
    '{"Google","Facebook","Microsoft"}',
    false
),
(
    '3sum', 
    '3Sum', 
    'Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.

Notice that the solution set must not contain duplicate triplets.

Examples
Input: nums = [-1,0,1,2,-1,-4]
Output: [[-1,-1,2],[-1,0,1]]
Explanation: 
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0.
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0.
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0.
The distinct triplets are [-1,0,1] and [-1,-1,2].
Notice that the order of the output and the order of the triplets does not matter.

Input: nums = [0,1,1]
Output: []
Explanation: The only possible triplet does not sum up to 0.

Input: nums = [0,0,0]
Output: [[0,0,0]]
Explanation: The only possible triplet sums up to 0.

Constraints
• 3 <= nums.length <= 3000
• -10^5 <= nums[i] <= 10^5', 
    'Medium', 
    '32.6', -- Random acceptance rate 30-70%
    414, -- Total accepted
    668, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums
 * @return {number[][]}
 */
var threeSum = function(nums) {
    
};', 
    'class Solution {
public:
    vector<vector<int>> threeSum(vector<int>& nums) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Two Pointers","Sorting"}', 
    '{"Facebook","Google","Amazon"}',
    false
),
(
    'product-of-array-except-self', 
    'Product of Array Except Self', 
    'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.

Examples
Input: nums = [1,2,3,4]
Output: [24,12,8,6]

Input: nums = [-1,1,0,-3,3]
Output: [0,0,9,0,0]

Constraints
• 2 <= nums.length <= 10^5
• -30 <= nums[i] <= 30
• The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.', 
    'Medium', 
    '37.1', -- Random acceptance rate 30-70%
    416, -- Total accepted
    1586, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums
 * @return {number[]}
 */
var productExceptSelf = function(nums) {
    
};', 
    'class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Prefix Sum"}', 
    '{"Amazon","Microsoft","Facebook"}',
    false
),
(
    'group-anagrams', 
    'Group Anagrams', 
    'Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

Examples
Input: strs = ["eat","tea","tan","ate","nat","bat"]
Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

Input: strs = [""]
Output: [[""]]

Input: strs = ["a"]
Output: [["a"]]

Constraints
• 1 <= strs.length <= 10^4
• 0 <= strs[i].length <= 100
• strs[i] consists of lowercase English letters.', 
    'Medium', 
    '44.9', -- Random acceptance rate 30-70%
    337, -- Total accepted
    763, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {string[]} strs
 * @return {string[][]}
 */
var groupAnagrams = function(strs) {
    
};', 
    'class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Hash Table","String","Sorting"}', 
    '{"Amazon","Microsoft","Google"}',
    false
),
(
    'trapping-rain-water', 
    'Trapping Rain Water', 
    'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Examples
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The above elevation map (black section) is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. In this case, 6 units of rain water (blue section) are being trapped.

Input: height = [4,2,0,3,2,5]
Output: 9

Constraints
• n == height.length
• 1 <= n <= 2 * 10^4
• 0 <= height[i] <= 10^5', 
    'Hard', 
    '31.4', -- Random acceptance rate 30-70%
    423, -- Total accepted
    1403, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} height
 * @return {number}
 */
var trap = function(height) {
    
};', 
    'class Solution {
public:
    int trap(vector<int>& height) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Two Pointers","Dynamic Programming","Stack"}', 
    '{"Amazon","Google","Goldman Sachs"}',
    false
),
(
    'median-of-two-sorted-arrays', 
    'Median of Two Sorted Arrays', 
    'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Examples
Input: nums1 = [1,3], nums2 = [2]
Output: 2.00000
Explanation: merged array = [1,2,3] and median is 2.

Input: nums1 = [1,2], nums2 = [3,4]
Output: 2.50000
Explanation: merged array = [1,2,3,4] and median is (2 + 3) / 2 = 2.5.

Constraints
• nums1.length == m
• nums2.length == n
• 0 <= m <= 1000
• 0 <= n <= 1000
• 1 <= m + n <= 2000
• -10^6 <= nums1[i], nums2[j] <= 10^6', 
    'Hard', 
    '69.7', -- Random acceptance rate 30-70%
    51, -- Total accepted
    836, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
var findMedianSortedArrays = function(nums1, nums2) {
    
};', 
    'class Solution {
public:
    double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Binary Search","Divide and Conquer"}', 
    '{"Amazon","Google","Microsoft"}',
    false
),
(
    'merge-k-sorted-lists', 
    'Merge k Sorted Lists', 
    'You are given an array of k linked-lists lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Examples
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]
Explanation: The linked-lists are:
[
  1->4->5,
  1->3->4,
  2->6
]
merging them into one sorted list:
1->1->2->3->4->4->5->6

Input: lists = []
Output: []

Input: lists = [[]]
Output: []

Constraints
• k == lists.length
• 0 <= k <= 10^4
• 0 <= lists[i].length <= 500
• -10^4 <= lists[i][j] <= 10^4
• lists[i] is sorted in ascending order.
• The sum of lists[i].length will not exceed 10^4.', 
    'Hard', 
    '30.3', -- Random acceptance rate 30-70%
    339, -- Total accepted
    753, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 */
/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
var mergeKLists = function(lists) {
    
};', 
    '/**
 * Definition for singly-linked list.
 * struct ListNode {
 *     int val;
 *     ListNode *next;
 *     ListNode() : val(0), next(nullptr) {}
 *     ListNode(int x) : val(x), next(nullptr) {}
 *     ListNode(int x, ListNode *next) : val(x), next(next) {}
 * };
 */
class Solution {
public:
    ListNode* mergeKLists(vector<ListNode*>& lists) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Linked List","Divide and Conquer","Heap (Priority Queue)"}', 
    '{"Facebook","Amazon","Microsoft"}',
    false
),
(
    'climbing-stairs', 
    'Climbing Stairs', 
    'You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Examples
Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps

Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step

Constraints
• 1 <= n <= 45', 
    'Easy', 
    '67.0', -- Random acceptance rate 30-70%
    190, -- Total accepted
    1187, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function(n) {
    
};', 
    'class Solution {
public:
    int climbStairs(int n) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Math","Dynamic Programming","Memoization"}', 
    '{"Amazon","Google","Adobe"}',
    true
),
(
    'single-number', 
    'Single Number', 
    'Given a non-empty array of integers nums, every element appears twice except for one. Find that single one.

You must implement a solution with a linear runtime complexity and use only constant extra space.

Examples
Input: nums = [2,2,1]
Output: 1

Input: nums = [4,1,2,1,2]
Output: 4

Input: nums = [1]
Output: 1

Constraints
• 1 <= nums.length <= 3 * 10^4
• -3 * 10^4 <= nums[i] <= 3 * 10^4
• Each element in the array appears twice except for one element which appears only once.', 
    'Easy', 
    '41.6', -- Random acceptance rate 30-70%
    161, -- Total accepted
    712, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} nums
 * @return {number}
 */
var singleNumber = function(nums) {
    
};', 
    'class Solution {
public:
    int singleNumber(vector<int>& nums) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Bit Manipulation"}', 
    '{"Amazon","Google","Apple"}',
    true
),
(
    'longest-palindromic-substring', 
    'Longest Palindromic Substring', 
    'Given a string s, return the longest palindromic substring in s.

Examples
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.

Input: s = "cbbd"
Output: "bb"

Constraints
• 1 <= s.length <= 1000
• s consist of only digits and English letters.', 
    'Medium', 
    '56.5', -- Random acceptance rate 30-70%
    273, -- Total accepted
    975, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {string} s
 * @return {string}
 */
var longestPalindrome = function(s) {
    
};', 
    'class Solution {
public:
    string longestPalindrome(string s) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"String","Dynamic Programming"}', 
    '{"Amazon","Microsoft","Google"}',
    true
),
(
    'container-with-most-water', 
    'Container With Most Water', 
    'You are given an integer array height of length n. There are n vertical lines drawn such that the two endpoints of the ith line are (i, 0) and (i, height[i]).

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Notice that you may not slant the container.

Examples
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, the max area of water (blue section) the container can contain is 49.

Input: height = [1,1]
Output: 1

Constraints
• n == height.length
• 2 <= n <= 10^5
• 0 <= height[i] <= 10^4', 
    'Medium', 
    '61.7', -- Random acceptance rate 30-70%
    281, -- Total accepted
    701, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} height
 * @return {number}
 */
var maxArea = function(height) {
    
};', 
    'class Solution {
public:
    int maxArea(vector<int>& height) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Two Pointers","Greedy"}', 
    '{"Amazon","Google","Facebook"}',
    true
),
(
    'edit-distance', 
    'Edit Distance', 
    'Given two strings word1 and word2, return the minimum number of operations required to convert word1 to word2.

You have the following three operations permitted on a word:
• Insert a character
• Delete a character
• Replace a character

Examples
Input: word1 = "horse", word2 = "ros"
Output: 3
Explanation: 
horse -> rorse (replace ''h'' with ''r'')
rorse -> rose (remove ''r'')
rose -> ros (remove ''e'')

Input: word1 = "intention", word2 = "execution"
Output: 5
Explanation: 
intention -> inention (remove ''t'')
inention -> enention (replace ''i'' with ''e'')
enention -> exention (replace ''n'' with ''x'')
exention -> exection (replace ''n'' with ''c'')
exection -> execution (insert ''u'')

Constraints
• 0 <= word1.length, word2.length <= 500
• word1 and word2 consist of lowercase English letters.', 
    'Hard', 
    '37.2', -- Random acceptance rate 30-70%
    401, -- Total accepted
    1312, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {string} word1
 * @param {string} word2
 * @return {number}
 */
var minDistance = function(word1, word2) {
    
};', 
    'class Solution {
public:
    int minDistance(string word1, string word2) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"String","Dynamic Programming"}', 
    '{"Google","Amazon","Microsoft"}',
    true
),
(
    'largest-rectangle-in-histogram', 
    'Largest Rectangle in Histogram', 
    'Given an array of integers heights representing the histogram''s bar height where the width of each bar is 1, return the area of the largest rectangle in the histogram.

Examples
Input: heights = [2,1,5,6,2,3]
Output: 10
Explanation: The largest rectangle has an area = 10 units.

Input: heights = [2,4]
Output: 4

Constraints
• 1 <= heights.length <= 10^5
• 0 <= heights[i] <= 10^4', 
    'Hard', 
    '56.2', -- Random acceptance rate 30-70%
    280, -- Total accepted
    1408, -- Total submissions
    '[{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"},{"input":"placeholder","output":"placeholder","explanation":"Hidden test case"}]'::jsonb,
    '/**
 * @param {number[]} heights
 * @return {number}
 */
var largestRectangleArea = function(heights) {
    
};', 
    'class Solution {
public:
    int largestRectangleArea(vector<int>& heights) {
        
    }
};', 
    'Hint 1,Hint 2', 
    '{"Array","Stack","Monotonic Stack"}', 
    '{"Google","Amazon","Facebook"}',
    true
);