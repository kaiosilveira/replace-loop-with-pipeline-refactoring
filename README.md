[![Continuous Integration](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/actions/workflows/ci.yml/badge.svg)](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/actions/workflows/ci.yml)

ℹ️ _This repository is part of my Refactoring catalog based on Fowler's book with the same title. Please see [kaiosilveira/refactoring](https://github.com/kaiosilveira/refactoring) for more details._

---

# Replace loop with pipeline

<table>
<thead>
<th>Before</th>
<th>After</th>
</thead>
<tbody>
<tr>
<td>

```javascript
const names = [];
for (const i of input) {
  if (i.job === 'programmer') {
    names.push(i.name);
  }
}
```

</td>

<td>

```javascript
const names = input.filter(i => i.job === 'programmer').map(i => i.name);
```

</td>
</tr>
</tbody>
</table>

Loops are one of the most basic programming constructs and they're present in virtually all programming languages. Sometimes, though, there are more idiomatic and programming language-specific ways to do the same task and accomplish the same results. This helps with migrating to those cases.

## Working example

Our working example, extracted from the book, is a program that receives some data from a CSV file and processes it to filter for records from offices located in India. It also maps the lines so they're represented as objects. The function code looks like this:

```javascript
function acquireData(input) {
  const lines = input.split('\n');
  let firstLine = true;
  let result = [];

  for (const line of lines) {
    if (firstLine) {
      firstLine = false;
      continue;
    }

    if (line.trim() === '') continue;

    const record = line.split(',');
    if (record[1].trim === 'India') {
      result.push({ city: record[0].trim(), phone: record[2].trim() });
    }
  }

  return result;
}
```

And the data structure looks like this:

```csv
office, country, telephone
Chicago, USA, +1 312 373 1000
Beijing, China, +86 4008 900 505
Bangalore, India, +91 80 4064 9570
Porto Alegre, Brazil, +55 51 3079 3550
Chennai, India, +91 44 660 44766
```

### Test suite

The test suite for this tiny program covers the main aspects and rules of it:

- ignoring the headers
- ignoring empty lines
- filtering out records that are other than India
- mapping lines to objects
- returning the results that match the criteria

The full test suite can be seen **[here](./src/acquire-data/index.test.js)**.

With these tests in place, we're ready to start refactoring.

### Steps

We start by introducing a new variable to hold our pipeline operations. We also use it as the basis for the loop, so the behavior remains the same:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -2,8 +2,8 @@ export function acquireData(input) {
   const lines = input.split('\n');
   let firstLine = true;
   let result = [];
-
-  for (const line of lines) {
+  const loopLines = lines;
+  for (const line of loopLines) {
     if (firstLine) {
       firstLine = false;
       continue;
```

Starting our migration, we can move the "skipping the first line" logic to a `.slice`:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
index 75bdeaf..8bc0206 100644
@@ -2,13 +2,8 @@ export function acquireData(input) {
   const lines = input.split('\n');
   let firstLine = true;
   let result = [];
-  const loopLines = lines;
+  const loopLines = lines.slice(1);
   for (const line of loopLines) {
-    if (firstLine) {
-      firstLine = false;
-      continue;
-    }
-
     if (line.trim() === '') continue;

     const record = line.split(',');
```

This frees us from the need of `firstLine`, so we remove it:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,6 +1,5 @@
 export function acquireData(input) {
   const lines = input.split('\n');
-  let firstLine = true;
   let result = [];
   const loopLines = lines.slice(1);
   for (const line of loopLines) {
```

Then, we apply the same logic to the "skip blank lines" logic to a `.filter`

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,10 +1,8 @@
 export function acquireData(input) {
   const lines = input.split('\n');
   let result = [];
-  const loopLines = lines.slice(1);
+  const loopLines = lines.slice(1).filter(line => line.trim() !== '');
   for (const line of loopLines) {
-    if (line.trim() === '') continue;
-
     const record = line.split(',');
     if (record[1].trim() === 'India') {
       result.push({ city: record[0].trim(), phone: record[2].trim() });
```

Moving on, we can move the "split lines" to a `.map`:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,9 +1,13 @@
 export function acquireData(input) {
   const lines = input.split('\n');
   let result = [];
-  const loopLines = lines.slice(1).filter(line => line.trim() !== '');
+  const loopLines = lines
+    .slice(1)
+    .filter(line => line.trim() !== '')
+    .map(line => line.split(','));
+
   for (const line of loopLines) {
-    const record = line.split(',');
+    const record = line;
     if (record[1].trim() === 'India') {
       result.push({ city: record[0].trim(), phone: record[2].trim() });
     }
```

Then, we can filter for records of offices located in India using a call to `.filter`:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -4,13 +4,12 @@ export function acquireData(input) {
   const loopLines = lines
     .slice(1)
     .filter(line => line.trim() !== '')
-    .map(line => line.split(','));
+    .map(line => line.split(','))
+    .filter(record => record[1].trim() === 'India');

   for (const line of loopLines) {
     const record = line;
-    if (record[1].trim() === 'India') {
-      result.push({ city: record[0].trim(), phone: record[2].trim() });
-    }
+    result.push({ city: record[0].trim(), phone: record[2].trim() });
   }

   return result;
```

Lastly, we can map the lines to objects using a `.map`:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -5,11 +5,12 @@ export function acquireData(input) {
     .slice(1)
     .filter(line => line.trim() !== '')
     .map(line => line.split(','))
-    .filter(record => record[1].trim() === 'India');
+    .filter(record => record[1].trim() === 'India')
+    .map(record => ({ city: record[0].trim(), phone: record[2].trim() }));

   for (const line of loopLines) {
     const record = line;
-    result.push({ city: record[0].trim(), phone: record[2].trim() });
+    result.push(line);
   }

   return result;
```

And now we can safely remove the `for` loop and assign the pipeline directly to `result`:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,17 +1,11 @@
 export function acquireData(input) {
   const lines = input.split('\n');
-  let result = [];
-  const loopLines = lines
+  let result = lines
     .slice(1)
     .filter(line => line.trim() !== '')
     .map(line => line.split(','))
     .filter(record => record[1].trim() === 'India')
     .map(record => ({ city: record[0].trim(), phone: record[2].trim() }));

-  for (const line of loopLines) {
-    const record = line;
-    result.push(line);
-  }
-
   return result;
 }
```

That's it for the refactoring! Before we finish, though, we can inline the `results` variable:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,11 +1,9 @@
 export function acquireData(input) {
   const lines = input.split('\n');
-  let result = lines
+  return lines
     .slice(1)
     .filter(line => line.trim() !== '')
     .map(line => line.split(','))
     .filter(record => record[1].trim() === 'India')
     .map(record => ({ city: record[0].trim(), phone: record[2].trim() }));
-
-  return result;
 }
```

and rename the inner pipeline variables:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -4,6 +4,6 @@ export function acquireData(input) {
     .slice(1)
     .filter(line => line.trim() !== '')
     .map(line => line.split(','))
-    .filter(record => record[1].trim() === 'India')
-    .map(record => ({ city: record[0].trim(), phone: record[2].trim() }));
+    .filter(fields => fields[1].trim() === 'India')
+    .map(fields => ({ city: fields[0].trim(), phone: fields[2].trim() }));
 }
```

and, finally, we can format the code so it looks more like a table:

```diff
diff --git a/src/acquire-data/index.js b/src/acquire-data/index.js
@@ -1,9 +1,10 @@
 export function acquireData(input) {
   const lines = input.split('\n');
   return lines
-    .slice(1)
-    .filter(line => line.trim() !== '')
-    .map(line => line.split(','))
-    .filter(fields => fields[1].trim() === 'India')
-    .map(fields => ({ city: fields[0].trim(), phone: fields[2].trim() }));
+    .slice  (1)
+    .filter (line   => line.trim() !== '')
+    .map    (line   => line.split(','))
+    .filter (fields => fields[1].trim() === 'India')
+    .map    (fields => ({ city: fields[0].trim(), phone: fields[2].trim() }))
+    ;
 }
```

And that's it!

### Commit history

Below there's the commit history for the steps detailed above.

| Commit SHA                                                                                                                        | Message                                |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| [a9cd7ff](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/a9cd7ffa35fb28e2a6c0a04f72a38f4b80e7af2a) | introduce loop variable                |
| [c8d2506](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/c8d25065c438a50d3b0a21cff94ff7a734ccc222) | Skip first line via `.slice`           |
| [0aa4a9a](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/0aa4a9a08a00d121d389ae87f2d36ce35a80fad4) | Remove now unused `firstLine` variable |
| [a8e6244](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/a8e62448026fe46bc2300e80e0295d360da438cd) | Skip blank lines via `.filter`         |
| [57487d5](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/57487d5776b7d46882351f3eb2e04db886398716) | split lines via `.map`                 |
| [dee5afd](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/dee5afda3d7a84c9970a6e69a14192da22460f73) | filter for India records via `.filter` |
| [2c07ff2](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/2c07ff209a889b820e10904037932d71e5d2ed47) | map records via `.map`                 |
| [ff74441](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/ff744418b462b35c65e8cc586d691ffcccc68833) | remove `for` loop                      |
| [2666e3b](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/2666e3b52cb28bbeaa4ad701fb804ef7fe384724) | inline `results` var                   |
| [7931f42](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/7931f42ae51af734e1db274e2d092c4223830284) | rename pipeline variables              |
| [886c5b3](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commit/886c5b3c167b4d5d219917879cefb6807fb2e61d) | format code so it looks like a table   |

For the full commit history for this project, check the [Commit History tab](https://github.com/kaiosilveira/replace-loop-with-pipeline-refactoring/commits/main).
