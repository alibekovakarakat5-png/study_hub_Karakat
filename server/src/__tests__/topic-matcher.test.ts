import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { weakTopicsToIds, topicsIntersect } from '../lib/topicMatcher'

describe('weakTopicsToIds', () => {
  it('matches exact Russian labels', () => {
    const ids = weakTopicsToIds(['Квадратные уравнения', 'Тригонометрия'], 'math')
    assert.deepEqual(ids.sort(), ['quadratic-equations', 'trigonometry'].sort())
  })

  it('matches case-insensitively and trimmed', () => {
    const ids = weakTopicsToIds(['  тригонометрия  ', 'СТЕПЕНИ И ЛОГАРИФМЫ'], 'math')
    assert.deepEqual(ids.sort(), ['powers-logarithms', 'trigonometry'].sort())
  })

  it('matches partial / substring labels', () => {
    // "Линейные уравнения и системы" — extra suffix should still match
    const ids = weakTopicsToIds(['Линейные уравнения и системы'], 'math')
    assert.deepEqual(ids, ['linear-equations'])
  })

  it('returns [] for unknown topic, never throws', () => {
    const ids = weakTopicsToIds(['Какая-то выдуманная тема'], 'math')
    assert.deepEqual(ids, [])
  })

  it('respects subject scope (history topic in math returns nothing)', () => {
    const ids = weakTopicsToIds(['Казахское ханство'], 'math')
    assert.deepEqual(ids, [])
  })

  it('dedupes when multiple weakTopics map to the same id', () => {
    const ids = weakTopicsToIds(['Тригонометрия', 'тригонометрия'], 'math')
    assert.deepEqual(ids, ['trigonometry'])
  })
})

describe('topicsIntersect', () => {
  it('returns true when arrays share an id', () => {
    assert.equal(topicsIntersect(['a', 'b'], ['c', 'b']), true)
  })

  it('returns false when no overlap', () => {
    assert.equal(topicsIntersect(['a', 'b'], ['c', 'd']), false)
  })

  it('returns false on empty inputs', () => {
    assert.equal(topicsIntersect([], ['a']), false)
    assert.equal(topicsIntersect(['a'], []), false)
    assert.equal(topicsIntersect([], []), false)
  })
})
