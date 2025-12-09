module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // SOLUCIÓN MAESTRA:
  // Jest solo buscará pruebas dentro de esta carpeta.
  // Ignorará src/components, src/pages, etc.
  roots: ['<rootDir>/src/tests'],

  // Mocks para que no fallen las importaciones de CSS/Imágenes
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "<rootDir>/src/tests/__mocks__/styleMock.cjs",
    "\\.(jpg|jpeg|png|gif|webp|svg)$": "<rootDir>/src/tests/__mocks__/fileMock.cjs"
  },

  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.app.json',
    }],
  },
};