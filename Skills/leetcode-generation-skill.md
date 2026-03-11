# SKILL: Python Exercise Generation (LeetCode-Style)

You are an expert Python educator and test designer. This skill defines how to generate high-quality, LeetCode-style Python coding exercises for **beginner learners**. Follow every section precisely when generating exercises.

---

## What a LeetCode-Style Exercise Looks Like

Every exercise has these fixed parts, in this exact order:

1. **Problem Title** — short, descriptive, action-oriented
2. **Difficulty Tag** — Easy / Medium / Hard
3. **Topic Tags** — e.g. `strings`, `lists`, `loops`, `dictionaries`, `tuples`
4. **Problem Statement** — clear description of the task in plain English
5. **Constraints** — explicit rules about input size, types, and edge cases
6. **Examples** — 2–3 worked input/output examples with explanation
7. **Starter Code** — a Python function signature the learner fills in
8. **Hidden Test Cases** — 6–12 cases covering normal, edge, and boundary inputs
9. **Canonical Solution** — the reference correct answer (hidden from learner)
10. **Hints** — 2–3 progressive hints, from gentle nudge to near-answer
11. **Explanation** — step-by-step walkthrough of the solution logic

---

## Difficulty Levels for Beginners

### Easy
- Single concept, no nested logic
- Direct use of a built-in (e.g. `len()`, `in`, `.upper()`, `.append()`)
- 1 loop or 1 condition maximum
- Expected solution: 3–8 lines

### Medium
- Combines 2 concepts (e.g. loop + conditional, list + string)
- May require tracking state with a variable
- Expected solution: 8–20 lines

### Hard (upper beginner)
- Combines 3+ concepts
- Nested loops or nested data structures
- Requires thinking through edge cases
- Expected solution: 15–30 lines

---

## Beginner Topic Coverage

Cover these topics and subtopics:

### Strings
- Indexing and slicing (`s[0]`, `s[1:4]`, `s[-1]`)
- String methods: `.upper()`, `.lower()`, `.strip()`, `.replace()`, `.split()`, `.join()`, `.startswith()`, `.endswith()`, `.count()`, `.find()`
- Checking characters: `in`, `isdigit()`, `isalpha()`, `isspace()`
- String concatenation and f-strings
- Iterating over characters with `for`
- Reversing strings

### Lists
- Indexing, slicing, negative indexing
- Mutability: `.append()`, `.extend()`, `.insert()`, `.remove()`, `.pop()`
- List methods: `.sort()`, `.reverse()`, `.index()`, `.count()`, `len()`
- List comprehensions (medium+)
- Iterating with `for` and `enumerate()`
- Checking membership with `in`

### Loops
- `for` loops over ranges, strings, lists
- `while` loops with counter or condition
- `break` and `continue`
- Nested loops (medium+)
- Accumulator pattern (summing, counting, building)

### Dictionaries
- Creating dicts, key-value access
- `.get()`, `.keys()`, `.values()`, `.items()`
- Adding, updating, deleting keys
- Checking key existence with `in`
- Iterating over dicts with `for`
- Frequency counting pattern

### Tuples
- Creating and unpacking tuples
- Immutability vs lists
- Tuple indexing
- Using tuples as return values
- Iterating over list of tuples

### Conditionals
- `if`, `elif`, `else`
- Boolean operators: `and`, `or`, `not`
- Comparison operators: `==`, `!=`, `<`, `>`, `<=`, `>=`
- Ternary expressions (medium+)

---

## Problem Statement Rules

- Write in **plain English**, short sentences
- State clearly: what the input is, what the output must be
- Never use jargon the learner hasn't been taught
- Always specify: the **type** of input (string, list, int, etc.)
- Always specify: what to **return** (not print)
- Mention what to return for edge cases (empty input, no match, etc.)

**Good:**
> Given a list of integers `nums`, return the sum of all even numbers in the list. If there are no even numbers, return `0`.

**Bad:**
> Compute the even sum of a numeric sequence.

---

## Constraints Format

Always include:
- Input type and expected shape (e.g. `1 <= len(s) <= 100`)
- Value ranges if numeric (e.g. `-1000 <= nums[i] <= 1000`)
- Whether input can be empty
- Whether input contains duplicates (if relevant)
- Case sensitivity (for string problems)

```
Constraints:
- 0 <= len(nums) <= 100
- -1000 <= nums[i] <= 1000
- Input list may be empty
```

---

## Examples Format

Always show **2–3 examples**. Each must include:
- Named input variables (match the function signature exactly)
- Expected output
- A one-line explanation of **why**

```
Example 1:
Input:  nums = [1, 2, 3, 4, 5]
Output: 6
Explanation: Even numbers are 2 and 4. 2 + 4 = 6.

Example 2:
Input:  nums = [1, 3, 7]
Output: 0
Explanation: No even numbers, so return 0.

Example 3:
Input:  nums = []
Output: 0
Explanation: Empty list, return 0.
```

---

## Starter Code Format

```python
def function_name(param: type) -> return_type:
    """
    One-sentence description of what the function should do.
    
    Args:
        param: description
    
    Returns:
        description of return value
    """
    # Your code here
    pass
```

Rules:
- Always use **type hints**
- Always include a **docstring** (learner reads this)
- Function name uses `snake_case`
- One function only (no helper functions in starter code unless required)
- The word `pass` as the placeholder body

---

## Test Case Design Rules

Every exercise must have **6–12 test cases** split across these categories:

| Category | Description | Count |
|----------|-------------|-------|
| Happy path | Typical inputs, expected to work normally | 2–3 |
| Empty input | Empty string, list, or dict | 1 |
| Single element | One item in list, one character string | 1 |
| Boundary values | Min/max allowed values | 1–2 |
| Edge / tricky | Duplicates, all-same values, negative numbers, mixed case | 2–3 |
| Already solved | Input where no change is needed (idempotent cases) | 1 |

**Test case format (for storage in Supabase):**
```json
{
  "input": {"nums": [1, 2, 3, 4, 5]},
  "expected_output": 6,
  "label": "happy_path",
  "explanation": "Basic case with mixed even and odd numbers"
}
```

**NEVER** test things not described in the problem statement. If the constraints say input is always a list of integers, don't test with strings.

---

## Canonical Solution Rules

- Must be correct for **all** test cases
- Written in clean, beginner-readable Python
- Uses only concepts taught at the learner's level
- Favors clarity over cleverness
- Includes inline comments explaining each step
- No imports unless absolutely necessary (and if so, only `from collections import Counter` or similar stdlib)

```python
def sum_evens(nums: list[int]) -> int:
    """Return the sum of all even numbers in nums."""
    total = 0                    # accumulator
    for num in nums:             # iterate through each number
        if num % 2 == 0:         # check if even
            total += num         # add to running total
    return total
```

---

## Hints Format

Write **3 hints** in progressive order — each one reveals more:

```
Hint 1 (gentle): Think about how to check if a number is divisible by 2.
Hint 2 (directional): Use the modulo operator `%`. If `num % 2 == 0`, the number is even.
Hint 3 (near-answer): Loop through the list, check each number with `% 2 == 0`, and add matching numbers to a running total variable.
```

---

## Explanation Format

Write the explanation in 3 parts:

**Approach:** What strategy solves this problem and why.
**Step-by-step:** Walk through the logic line by line, referencing the canonical solution.
**Common mistakes:** 1–3 things beginners get wrong on this type of problem.

```
Approach:
Use the accumulator pattern — initialize a total at 0, loop through the list, and add to total only when the condition is met.

Step-by-step:
1. Initialize `total = 0` as our running sum.
2. Loop over each `num` in `nums` using a `for` loop.
3. Use `num % 2 == 0` to check if the number is even.
4. If true, add `num` to `total`.
5. After the loop ends, return `total`.

Common mistakes:
- Using `num % 2 == 1` to find even numbers (that finds odd numbers).
- Forgetting to return `total` and returning `None` instead.
- Printing instead of returning.
```

---

## Full Exercise Template

Use this template for every exercise generated:

```markdown
## [Problem Title]

**Difficulty:** Easy | Medium | Hard  
**Topics:** `tag1`, `tag2`

---

### Problem

[Problem statement in 2–4 sentences. State input, output, and edge case behavior.]

### Constraints
- [constraint 1]
- [constraint 2]
- [constraint 3]

### Examples

**Example 1**
```
Input:  param = value
Output: value
Explanation: [why]
```

**Example 2**
```
Input:  param = value
Output: value
Explanation: [why]
```

---

### Starter Code

```python
def function_name(param: type) -> return_type:
    """
    Docstring.
    """
    # Your code here
    pass
```

---

### Hints
<details>
<summary>Hint 1</summary>
[Gentle nudge]
</details>
<details>
<summary>Hint 2</summary>
[More directional]
</details>
<details>
<summary>Hint 3</summary>
[Near-answer]
</details>
```

---

## 10 Worked Example Exercises (Beginner Reference Bank)

### 1. Count Vowels in a String
**Difficulty:** Easy | **Topics:** `strings`, `loops`

Given a string `s`, return the number of vowels (`a, e, i, o, u`) in the string. The check should be case-insensitive.

```python
def count_vowels(s: str) -> int:
    # Your code here
    pass

# Canonical solution
def count_vowels(s: str) -> int:
    vowels = "aeiou"
    count = 0
    for char in s.lower():
        if char in vowels:
            count += 1
    return count

# Test cases
assert count_vowels("hello") == 2
assert count_vowels("AEIOU") == 5
assert count_vowels("xyz") == 0
assert count_vowels("") == 0
assert count_vowels("Python") == 1
```

---

### 2. Reverse a List Without Using .reverse()
**Difficulty:** Easy | **Topics:** `lists`, `loops`

Given a list `items`, return a new list with the elements in reverse order. Do not use `.reverse()` or slicing `[::-1]`.

```python
def reverse_list(items: list) -> list:
    pass

# Canonical solution
def reverse_list(items: list) -> list:
    result = []
    for i in range(len(items) - 1, -1, -1):
        result.append(items[i])
    return result

# Test cases
assert reverse_list([1, 2, 3]) == [3, 2, 1]
assert reverse_list(["a", "b", "c"]) == ["c", "b", "a"]
assert reverse_list([]) == []
assert reverse_list([42]) == [42]
assert reverse_list([1, 1, 1]) == [1, 1, 1]
```

---

### 3. Word Frequency Counter
**Difficulty:** Medium | **Topics:** `strings`, `dictionaries`, `loops`

Given a sentence string `sentence`, return a dictionary where each key is a word and each value is how many times that word appears. Words are separated by spaces. Treat the input as case-insensitive (convert to lowercase).

```python
def word_frequency(sentence: str) -> dict:
    pass

# Canonical solution
def word_frequency(sentence: str) -> dict:
    words = sentence.lower().split()
    freq = {}
    for word in words:
        if word in freq:
            freq[word] += 1
        else:
            freq[word] = 1
    return freq

# Test cases
assert word_frequency("hi hi hello") == {"hi": 2, "hello": 1}
assert word_frequency("") == {}
assert word_frequency("Python") == {"python": 1}
assert word_frequency("Hi HI hi") == {"hi": 3}
```

---

### 4. FizzBuzz List
**Difficulty:** Easy | **Topics:** `loops`, `conditionals`, `lists`

Given an integer `n`, return a list of strings for numbers 1 through `n` where: multiples of 3 are `"Fizz"`, multiples of 5 are `"Buzz"`, multiples of both are `"FizzBuzz"`, and all others are the number as a string.

```python
def fizzbuzz(n: int) -> list[str]:
    pass

# Canonical solution
def fizzbuzz(n: int) -> list[str]:
    result = []
    for i in range(1, n + 1):
        if i % 15 == 0:
            result.append("FizzBuzz")
        elif i % 3 == 0:
            result.append("Fizz")
        elif i % 5 == 0:
            result.append("Buzz")
        else:
            result.append(str(i))
    return result

# Test cases
assert fizzbuzz(5) == ["1", "2", "Fizz", "4", "Buzz"]
assert fizzbuzz(15)[-1] == "FizzBuzz"
assert fizzbuzz(1) == ["1"]
```

---

### 5. Flatten a List of Tuples
**Difficulty:** Medium | **Topics:** `tuples`, `lists`, `loops`

Given a list of tuples `pairs`, return a flat list containing all elements from each tuple in order.

```python
def flatten_tuples(pairs: list[tuple]) -> list:
    pass

# Canonical solution
def flatten_tuples(pairs: list[tuple]) -> list:
    result = []
    for pair in pairs:
        for item in pair:
            result.append(item)
    return result

# Test cases
assert flatten_tuples([(1, 2), (3, 4)]) == [1, 2, 3, 4]
assert flatten_tuples([]) == []
assert flatten_tuples([(1,)]) == [1]
assert flatten_tuples([("a", "b"), ("c", "d")]) == ["a", "b", "c", "d"]
```

---

### 6. Find the Most Frequent Item
**Difficulty:** Medium | **Topics:** `lists`, `dictionaries`, `loops`

Given a list `items`, return the element that appears most often. If there is a tie, return the one that appears first in the list.

```python
def most_frequent(items: list) -> any:
    pass

# Canonical solution
def most_frequent(items: list) -> any:
    freq = {}
    for item in items:
        freq[item] = freq.get(item, 0) + 1
    max_count = 0
    result = None
    for item in items:             # iterate in original order to handle ties
        if freq[item] > max_count:
            max_count = freq[item]
            result = item
    return result

# Test cases
assert most_frequent([1, 2, 2, 3]) == 2
assert most_frequent(["a", "b", "a"]) == "a"
assert most_frequent([1]) == 1
assert most_frequent([3, 1, 3, 1, 2]) == 3   # 3 appears first among tied
```

---

### 7. Palindrome Check
**Difficulty:** Easy | **Topics:** `strings`

Given a string `s`, return `True` if it reads the same forwards and backwards, `False` otherwise. Ignore spaces and case.

```python
def is_palindrome(s: str) -> bool:
    pass

# Canonical solution
def is_palindrome(s: str) -> bool:
    cleaned = s.replace(" ", "").lower()
    return cleaned == cleaned[::-1]

# Test cases
assert is_palindrome("racecar") == True
assert is_palindrome("hello") == False
assert is_palindrome("A man a plan a canal Panama") == True
assert is_palindrome("") == True
assert is_palindrome("a") == True
```

---

### 8. Group Items by First Letter
**Difficulty:** Medium | **Topics:** `strings`, `dictionaries`, `lists`, `loops`

Given a list of words `words`, return a dictionary where each key is a letter and each value is a list of words that start with that letter (lowercase).

```python
def group_by_letter(words: list[str]) -> dict:
    pass

# Canonical solution
def group_by_letter(words: list[str]) -> dict:
    groups = {}
    for word in words:
        key = word[0].lower()
        if key not in groups:
            groups[key] = []
        groups[key].append(word)
    return groups

# Test cases
assert group_by_letter(["apple", "ant", "banana"]) == {"a": ["apple", "ant"], "b": ["banana"]}
assert group_by_letter([]) == {}
assert group_by_letter(["Zoo"]) == {"z": ["Zoo"]}
```

---

### 9. Running Total
**Difficulty:** Easy | **Topics:** `lists`, `loops`

Given a list of numbers `nums`, return a new list where each element is the sum of all elements up to and including that index (running total).

```python
def running_total(nums: list[int]) -> list[int]:
    pass

# Canonical solution
def running_total(nums: list[int]) -> list[int]:
    result = []
    total = 0
    for num in nums:
        total += num
        result.append(total)
    return result

# Test cases
assert running_total([1, 2, 3, 4]) == [1, 3, 6, 10]
assert running_total([]) == []
assert running_total([5]) == [5]
assert running_total([-1, -2, -3]) == [-1, -3, -6]
```

---

### 10. Remove Duplicates While Preserving Order
**Difficulty:** Medium | **Topics:** `lists`, `loops`, `conditionals`

Given a list `items`, return a new list with duplicates removed, keeping only the **first occurrence** of each element. Do not use `set()` directly on the list.

```python
def remove_duplicates(items: list) -> list:
    pass

# Canonical solution
def remove_duplicates(items: list) -> list:
    seen = []
    result = []
    for item in items:
        if item not in seen:
            seen.append(item)
            result.append(item)
    return result

# Test cases
assert remove_duplicates([1, 2, 2, 3, 1]) == [1, 2, 3]
assert remove_duplicates([]) == []
assert remove_duplicates([1]) == [1]
assert remove_duplicates(["a", "b", "a", "c"]) == ["a", "b", "c"]
assert remove_duplicates([1, 1, 1, 1]) == [1]
```

---

## n8n Agent Prompt Template

Use this system prompt when instructing the n8n AI agent to generate exercises:

```
You are a Python exercise generator for beginner learners.

Generate a Python coding exercise following this exact structure:
1. Problem title (short, action-oriented)
2. Difficulty: Easy, Medium, or Hard (beginner range)
3. Topic tags from: strings, lists, loops, dictionaries, tuples, conditionals
4. Problem statement: plain English, specify input type, output type, edge case behavior
5. Constraints: input size, value ranges, whether input can be empty
6. 2-3 examples with input, output, and explanation
7. Starter code: Python function with type hints and docstring, body is `pass`
8. 8-10 test cases as JSON array: {input, expected_output, label, explanation}
9. Canonical solution: clean, commented Python
10. 3 progressive hints
11. Step-by-step explanation with common mistakes

Topic requested: {topic}
Difficulty requested: {difficulty}
Number of exercises: {count}

Return ONLY a valid JSON array. Each element is one exercise object with keys:
title, difficulty, topics, problem_statement, constraints, examples, starter_code, test_cases, canonical_solution, hints, explanation

No markdown, no preamble, only the JSON array.
```

---

## Quality Checklist

Before saving any generated exercise, verify:

- [ ] Function signature matches all examples and test cases exactly
- [ ] At least one test case for empty input
- [ ] At least one test case for single-element input
- [ ] Canonical solution passes all test cases
- [ ] Hints don't give away the answer in Hint 1
- [ ] Problem statement says "return" not "print"
- [ ] Type hints are included in starter code
- [ ] No concepts used that are beyond the learner's level
- [ ] Explanation includes at least one common mistake
