import { describe, expect, it } from 'vitest'
import { cleanGoogleClientId } from '../../src/config/env'

const ID = '664888808352-v93273q2nab33bdeoupfk47112fi2p8t.apps.googleusercontent.com'

describe('limpieza del client ID de Google', () => {
  it('deja intacto un ID correcto', () => {
    expect(cleanGoogleClientId(ID)).toBe(ID)
  })

  it('quita el salto de linea real que añaden algunos gestores de secretos', () => {
    expect(cleanGoogleClientId(`${ID}\r\n`)).toBe(ID)
    expect(cleanGoogleClientId(`${ID}\n`)).toBe(ID)
    expect(cleanGoogleClientId(`  ${ID}  `)).toBe(ID)
  })

  it('quita el salto de linea escapado (\\r\\n literal)', () => {
    expect(cleanGoogleClientId(`${ID}\\r\\n`)).toBe(ID)
    expect(cleanGoogleClientId(`${ID}\\n`)).toBe(ID)
  })

  it('devuelve cadena vacia si no hay valor', () => {
    expect(cleanGoogleClientId(undefined)).toBe('')
    expect(cleanGoogleClientId(null)).toBe('')
  })
})
