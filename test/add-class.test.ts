import { describe, expect, it } from 'vitest'
import { addClass } from '../src/core/generator'
import { reactTemplate, template } from '../src/core/snippets'

describe('add-class', () => {
  it('with vue', async () => {
    const str = addClass(template, 'vue', 'test-cls')
    expect(str).toContain('test-cls')

    const str2 = addClass(template, 'vue')
    expect(str2).not.toContain('test-cls')
    expect(str2).not.toContain('class')
  })

  it('with react', async () => {
    const str = addClass(reactTemplate, 'react', 'test-cls')
    expect(str).toContain('test-cls')

    const str2 = addClass(reactTemplate, 'react')
    expect(str2).not.toContain('test-cls')
  })
})
