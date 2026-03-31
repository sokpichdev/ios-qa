# Coding Interview Framework

> **Tags:** `#interview` `#problem-solving` `#algorithms` `#mindset`

---

## Q: What is the 7-step framework for cracking any coding interview?

**Answer:**

Most candidates fail coding interviews not because they can't code, but because they lack a structured thinking process. They panic and start writing code immediately — that's the fastest way to get rejected.

Here is the framework top candidates use:

---

### Step 1 — Clarify the Requirements

Never assume you understand the problem. Ask questions first:

- What is the input type and expected output?
- Are there constraints on time or space?
- Can the input be empty? Negative numbers? Duplicates?

> The interviewer *wants* you to ask. It shows you think before you code.

---

### Step 2 — Restate the Problem in Your Own Words

Say it back to the interviewer before touching the keyboard.

> *"So if I understand correctly, I need to find the longest substring without repeating characters and return its length."*

This catches misunderstandings early and proves you actually understand what you're solving.

---

### Step 3 — Start with Brute Force

Don't try to be clever yet. Describe the simplest, most obvious solution first — even if it's O(n²).

> *"My first thought is to check every possible pair using nested loops. It works, but it's slow."*

This proves you can solve the problem and gives you a foundation to improve upon.

---

### Step 4 — Optimize with Patterns

This is where practice pays off. Ask yourself:

- Can I trade space for time with a **hash map**?
- Is there a **two-pointer** technique?
- Would a **sliding window** help?
- Can I **sort first** to simplify?

Say your reasoning out loud:

> *"If I use a hash map to store values I've seen, I can check in O(1) instead of scanning the whole array."*

The interviewer is watching your reasoning, not just your final answer.

---

### Step 5 — Think Through Edge Cases

Before writing any code, list the tricky inputs:

- Empty array
- Single element
- All duplicates
- Negative numbers
- Maximum integer values

This shows the interviewer you write robust code, not just code that works on the happy path.

---

### Step 6 — State the Complexity

Before coding, tell the interviewer your time and space complexity.

> *"This runs in O(n) time and O(n) space because of the hash map."*

If you can't analyze your own solution, that's a red flag.

---

### Step 7 — Write Clean Code

Now, and only now, do you write code:

- Use meaningful variable names
- Write helper functions where appropriate
- Handle edge cases first
- Walk through each line as you write it
- Trace through your code with a test case when done

**Code Example:**

```swift
// Example: Longest substring without repeating characters
func lengthOfLongestSubstring(_ s: String) -> Int {
    var charIndex = [Character: Int]()
    var maxLength = 0
    var left = 0
    let chars = Array(s)

    for right in 0..<chars.count {
        // Edge case: duplicate found — move left pointer
        if let prevIndex = charIndex[chars[right]], prevIndex >= left {
            left = prevIndex + 1
        }
        charIndex[chars[right]] = right
        maxLength = max(maxLength, right - left + 1)
    }

    return maxLength
}
// Time: O(n) | Space: O(n)
```

---

### Summary

| Step | Action |
|------|--------|
| 1 | Clarify requirements |
| 2 | Restate the problem |
| 3 | Brute force first |
| 4 | Optimize with patterns |
| 5 | Think through edge cases |
| 6 | State time & space complexity |
| 7 | Write clean, traced code |

> **Remember:** The interview is not about the answer. It's about how you think.
> **Think first. Code second.**

---

**Tags:** `#interview` `#problem-solving` `#algorithms` `#hash-map` `#sliding-window` `#complexity`
