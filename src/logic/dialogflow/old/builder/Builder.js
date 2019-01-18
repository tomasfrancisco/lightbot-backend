/* eslint-disable no-unused-vars */

/**
 * Base builder to provide a little structure where the other builders are built on
 */
class Builder {
  /**
   * Transform all the data
   */
  build() {
    // Nothing
  }

  /**
   * Write all the data to the outputDirectory and zip it.
   */
  writeToFile(outputDirectory) {
    // Nothing
  }
}

module.exports = Builder;
