// Shared socket layouts. Operations with a unique layout declare it alongside their descriptions.
const vectors = 'vector2, vector3, vector4'
const floatOrVector = 'float, ' + vectors
const numeric = floatOrVector + ', color3, color4'
const sameAsFirst = { sameAs: 'In1' }

function uniform(inputs, type) {
  return { fixedTypes: { [inputs]: type, Output: type } }
}

function unary(types, ...additionalRows) {
  return { columns: ['In', 'Output'], rows: [[types, { sameAs: 'In' }], ...additionalRows] }
}

export default {
  unaryBoolean: uniform('In', 'boolean'),
  binaryBoolean: uniform('In1, In2', 'boolean'),
  unaryFloat: uniform('In', 'float'),
  binaryFloat: uniform('In1, In2', 'float'),
  unaryVector3: uniform('In', 'vector3'),
  unaryFloatOrVector: unary(floatOrVector),
  unaryColor: unary('color3, color4'),
  componentwiseUnary: unary(numeric),
  rounding: unary(numeric, ['float', 'integer']),
  componentwiseBinary: {
    columns: ['In1', 'In2', 'Output'],
    rows: [
      [numeric, sameAsFirst, sameAsFirst],
      [vectors + ', color3, color4', 'float', sameAsFirst],
    ],
  },
  blend: { fixedTypes: { Mix: 'float' }, columns: ['Fg, Bg', 'Output'], rows: [['float, color3, color4', { sameAs: 'Fg' }]] },
  alphaComposite: { fixedTypes: { 'Fg, Bg': 'color4', Mix: 'float', Output: 'color4' } },
  radialShape: { fixedTypes: { 'Texcoord, Center': 'vector2', Radius: 'float', Output: 'float' } },
  tiledShape: { fixedTypes: { 'Texcoord, Uvtiling, Uvoffset': 'vector2', Size: 'float', Staggered: 'boolean', Output: 'color3' } },
}
