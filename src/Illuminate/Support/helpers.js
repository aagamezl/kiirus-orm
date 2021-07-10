export const isNumeric = (value) => {
  return !Array.isArray(value) && (value - parseFloat(value) + 1) >= 0
}

// module.exports = {
//   isNumeric
// }
