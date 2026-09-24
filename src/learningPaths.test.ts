/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Test suite for Learning Paths Knowledge Graph & Search Verification
 * Runs with `npx tsx src/learningPaths.test.ts`
 */

import {
  VERIFIED_CURRICULA,
  validateCurriculumGraph,
  searchCurricula,
  getOrGenerateAcademicPath
} from './data/learningPathsData';
import { StructuredLearningPath } from './types';

// Curated 20 topics required by the user prompt
export const CURATED_20_TOPICS = [
  'quantum mechanics',
  'linear algebra',
  'docker',
  'supply and demand',
  'operating systems',
  'machine learning',
  'git',
  'calculus',
  'data structures',
  'networking',
  'relational databases',
  'macroeconomics',
  'biochemistry',
  'classical mechanics',
  'react web',
  'cryptography',
  'discrete math',
  'large language models',
  'system design',
  'probability'
];

let failed = 0;
let passed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${testName}${details ? ` -> ${details}` : ''}`);
  }
}

function runTests() {
  console.log('======================================================');
  console.log('Running Learning Paths Knowledge Graph Test Suite');
  console.log('======================================================\n');

  // Test 1: Curriculum Graph Validation (Base graph has >= 3 lessons per path, valid references, no cycles)
  console.log('Test Group 1: Base Knowledge Graph Integrity');
  const graphResult = validateCurriculumGraph(VERIFIED_CURRICULA);
  assert(graphResult.isValid, 'Knowledge graph has zero integrity errors', graphResult.errors.join('; '));
  assert(graphResult.totalPaths >= 20, `Knowledge graph contains ≥20 curated curricula (Found: ${graphResult.totalPaths})`);
  assert(graphResult.totalLessons >= 60, `Knowledge graph contains ≥60 rich lessons (Found: ${graphResult.totalLessons})`);

  // Test 2: Every path has >= 3 lessons in strictly sequential order
  console.log('\nTest Group 2: Lesson Counts & Ordering');
  for (const path of VERIFIED_CURRICULA) {
    assert(
      path.lessons.length >= 3,
      `Path "${path.id}" has ≥3 lessons (Found: ${path.lessons.length})`
    );

    // Verify prerequisite sequential ordering: any prerequisite lesson must precede the current lesson in the array
    for (let i = 0; i < path.lessons.length; i++) {
      const currentLesson = path.lessons[i];
      if (currentLesson.prerequisites && currentLesson.prerequisites.length > 0) {
        for (const prereqId of currentLesson.prerequisites) {
          const prereqIndex = path.lessons.findIndex(l => l.id === prereqId);
          assert(
            prereqIndex !== -1,
            `Prereq lesson "${prereqId}" exists in path "${path.id}"`
          );
          assert(
            prereqIndex < i,
            `Lesson "${currentLesson.id}" prerequisites strictly precede it in index order (${prereqIndex} < ${i})`
          );
        }
      }
    }
  }

  // Test 3: Every topic in curated test set of 20 topics returns a non-empty, valid path
  console.log('\nTest Group 3: 20-Topic Search Verification');
  for (const topic of CURATED_20_TOPICS) {
    const searchResults = searchCurricula(topic, VERIFIED_CURRICULA);
    const resolvedPath = getOrGenerateAcademicPath(topic, VERIFIED_CURRICULA);

    assert(
      searchResults.length > 0,
      `Curated topic "${topic}" returns at least 1 match from search index`
    );
    assert(
      Boolean(resolvedPath && resolvedPath.lessons && resolvedPath.lessons.length >= 3),
      `Curated topic "${topic}" resolves to valid curriculum with ≥3 lessons (Title: "${resolvedPath?.title}")`
    );
  }

  // Test 4: Circular Prerequisite Detection Fails Loudly
  console.log('\nTest Group 4: Circular Prerequisite Cycle Detection');
  const mockCyclicCurricula: StructuredLearningPath[] = [
    {
      id: 'cyclic-path-a',
      title: 'Cyclic Subject A',
      subject: 'Test',
      level: 'Beginner',
      description: 'Test A',
      tags: ['test'],
      estimatedHours: 4,
      prerequisites: ['cyclic-path-b'], // A requires B
      outcomes: ['Test'],
      lessons: [
        { id: 'ca-1', title: 'L1', concept: 'C1', summary: 'S1', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: [] },
        { id: 'ca-2', title: 'L2', concept: 'C2', summary: 'S2', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['ca-1'] },
        { id: 'ca-3', title: 'L3', concept: 'C3', summary: 'S3', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['ca-2'] }
      ]
    },
    {
      id: 'cyclic-path-b',
      title: 'Cyclic Subject B',
      subject: 'Test',
      level: 'Beginner',
      description: 'Test B',
      tags: ['test'],
      estimatedHours: 4,
      prerequisites: ['cyclic-path-a'], // B requires A -> Cycle!
      outcomes: ['Test'],
      lessons: [
        { id: 'cb-1', title: 'L1', concept: 'C1', summary: 'S1', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: [] },
        { id: 'cb-2', title: 'L2', concept: 'C2', summary: 'S2', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['cb-1'] },
        { id: 'cb-3', title: 'L3', concept: 'C3', summary: 'S3', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['cb-2'] }
      ]
    }
  ];

  const cyclicResult = validateCurriculumGraph(mockCyclicCurricula);
  assert(
    !cyclicResult.isValid,
    'validateCurriculumGraph catches cyclic path dependencies'
  );
  assert(
    cyclicResult.errors.some(err => err.toLowerCase().includes('circular') || err.toLowerCase().includes('cycle')),
    'Circular path detection produces explicit error message'
  );

  // Lesson-level circular prerequisite detection
  const mockLessonCyclicCurricula: StructuredLearningPath[] = [
    {
      id: 'lesson-cyclic-path',
      title: 'Lesson Cycle Subject',
      subject: 'Test',
      level: 'Beginner',
      description: 'Test',
      tags: ['test'],
      estimatedHours: 4,
      prerequisites: [],
      outcomes: ['Test'],
      lessons: [
        { id: 'lcycle-1', title: 'L1', concept: 'C1', summary: 'S1', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['lcycle-2'] },
        { id: 'lcycle-2', title: 'L2', concept: 'C2', summary: 'S2', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['lcycle-1'] },
        { id: 'lcycle-3', title: 'L3', concept: 'C3', summary: 'S3', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: [] }
      ]
    }
  ];

  const lessonCyclicResult = validateCurriculumGraph(mockLessonCyclicCurricula);
  assert(
    !lessonCyclicResult.isValid,
    'validateCurriculumGraph catches cyclic lesson prerequisites'
  );
  assert(
    lessonCyclicResult.errors.some(err => err.toLowerCase().includes('circular') || err.toLowerCase().includes('cycle')),
    'Circular lesson detection produces explicit error message'
  );

  // Test 5: Missing Prerequisite Reference Fails Loudly
  const mockDanglingCurricula: StructuredLearningPath[] = [
    {
      id: 'dangling-path',
      title: 'Dangling Reference Path',
      subject: 'Test',
      level: 'Beginner',
      description: 'Test',
      tags: ['test'],
      estimatedHours: 4,
      prerequisites: ['non-existent-path-999'],
      outcomes: ['Test'],
      lessons: [
        { id: 'dang-1', title: 'L1', concept: 'C1', summary: 'S1', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: ['non-existent-lesson-xyz'] },
        { id: 'dang-2', title: 'L2', concept: 'C2', summary: 'S2', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: [] },
        { id: 'dang-3', title: 'L3', concept: 'C3', summary: 'S3', minutes: 20, difficulty: 'Beginner', quiz: [], prerequisites: [] }
      ]
    }
  ];

  const danglingResult = validateCurriculumGraph(mockDanglingCurricula);
  assert(!danglingResult.isValid, 'validateCurriculumGraph catches non-existent path and lesson prerequisites');
  assert(danglingResult.errors.some(e => e.includes('non-existent-path-999')), 'Flags missing path ID');
  assert(danglingResult.errors.some(e => e.includes('non-existent-lesson-xyz')), 'Flags missing lesson ID');

  console.log('\n======================================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
