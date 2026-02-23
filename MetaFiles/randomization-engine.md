# Randomization Engine

*File-agnostic. Knows nothing about specific lists. Each list file tells you how many entries it has and how to roll — this file tells you how to roll fairly.*

---

## 1. Generating a Seed

Take the current datetime and write it as a 12-digit integer:

```
YYYYMMDDHHM → e.g. February 22 2026, 2:47 PM = 202602221447
```

Write this as the first line of your session file. Every roll in the session derives from it. Same seed = same story. Different seed = different story.

---

## 2. Rolling Against Any List of N Entries

Take a 3-digit window from the seed, apply mod N, add 1:

```
seed = 202602221447
window 1 = digits 1–3  → 202 mod N + 1
window 2 = digits 4–6  → 602 mod N + 1
window 3 = digits 7–9  → 022 mod N + 1
window 4 = digits 10–12 → 447 mod N + 1
```

For more than 4 rolls: multiply `seed × roll_number`, take the last 12 digits, continue.

**N comes from the list file itself** — each file's selection instruction block states how many entries it contains.

---

## 3. Weighted Rolls

Some list files specify that a subset of entries should hit more often (e.g. "cisgender ~60%"). To execute a weighted roll:

1. Roll d10 using the next seed window (take last digit of the window; 0 = 10)
2. The list file states the d10 threshold and which pool it maps to
3. Roll within that pool using the next window

If a list file does not specify weights, roll across the full list.

---

## 4. The Only Rule That Matters

**If the algorithm produces something strange, keep it.**

The most common failure mode is regression to the mean — defaulting to the safest, most familiar result. That is not random. The constraint is the generativity. A surprising result is the system working correctly.

Do not re-roll because a result is uncomfortable or hard to work with. If a coherence check in a list file forces a re-roll, use the next available seed window. Log the rejected result — the reason it was rejected is characterization.
