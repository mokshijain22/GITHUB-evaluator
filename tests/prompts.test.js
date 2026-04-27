import test from 'node:test';
import assert from 'node:assert/strict';
import { buildLinkedinPrompt, buildProfilePrompt, buildResumePrompt } from '../prompts.js';

test('buildProfilePrompt injects profile fields', () => {
  const prompt = buildProfilePrompt({
    user: { login: 'octocat', name: 'Octo Cat', bio: 'Bio', location: 'SF', blog: '', twitter_username: '', company: '', followers: 1, following: 2, public_repos: 3, public_gists: 4, created_at: '2020-01-01T00:00:00Z' },
    totalStars: 10,
    totalForks: 2,
    topLangs: ['JavaScript'],
    commitEvents: 8,
    prEvents: 1,
    repos: [{ name: 'repo1', stargazers_count: 5, language: 'JavaScript' }]
  });

  assert.match(prompt, /Username: octocat/);
  assert.match(prompt, /Total stars: 10 \| Forks: 2/);
});

test('buildLinkedinPrompt includes role and profile text', () => {
  const prompt = buildLinkedinPrompt({ targetRole: 'Frontend Engineer', profileText: 'A'.repeat(200) });
  assert.match(prompt, /Target role: Frontend Engineer/);
  assert.match(prompt, /Profile text:/);
});

test('buildResumePrompt includes company and role context', () => {
  const prompt = buildResumePrompt({ targetRole: 'ML Engineer', targetCompany: 'OpenAI', resumeText: 'B'.repeat(300) });
  assert.match(prompt, /Target role: ML Engineer/);
  assert.match(prompt, /Target company: OpenAI/);
});
