const min = Math.min, max = Math.max
/**
 * 2D Points: X,Y coordinates
 * @typedef {number[]} Point
 */
/**
 * 2D Boxes: MIN for top left corner and MAX for bottom right corner
 * @typedef {Point[]} Box
 */

/**
 * LayoutNodes have a bounding box:
 * - When using LayoutNodes as inputs for layout algorithms, only the widths and
 *   heights are calculated, previous position information is ignored.
 * - When applying layout algorithms, the bounding boxes are updated in a way that
 *   the width and height stays the same, but the position changes.
 * Beside that, LayoutNodes have references to children and an indicator on
 * whether the node was processed by the layout algorithm.
 * @typedef {Component} LayoutNode
 * @property {Box} _bb
 * @property {LayoutNode[]} _children
 * @property {boolean} _layout_done
 */

/**
 * Base Class for Layout Algorithms.
 * A Layout Algorithm should encapsulate the main logic and all data that is needed internally.
 * A corresponding layout() function should be used instead of instantiating LayoutAlgorithm classes directly.
 * @abstract
 */
class LayoutAlgorithm {
  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getNodeWidth(node) {
    return node._bb[1][0] - node._bb[0][0]
  }

  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getNodeHeight(node) {
    return node._bb[1][1] - node._bb[0][1]
  }

  /**
   * @param {LayoutNode} node
   * @returns {LayoutNode[]}
   */
  getChildren(node) {
    return node._children
  }
}

/**
 * Actual implementation of the tree layout algorithm.
 * Startet as a Port from Java to ES6 (see http://treelayout.sourceforge.net/)
 * For the Java Code see License below:
 * [The "BSD license"]
 * Copyright (c) 2011, abego Software GmbH, Germany (http://www.abego.org)
 * All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. Neither the name of the abego Software GmbH nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
class TreeLayout extends LayoutAlgorithm {
  /**
   * Override this method if you want to have more specific gaps between different node types
   * @param {LayoutNode} a
   * @param {LayoutNode} b
   * @return {number}
   */
  getGapBetweenNeighbors(a, b) {
    return this.gapBetweenNeighbors
  }

  /**
   * Override this method if you want to have more specific gaps at different levels
   * @param {int} level
   */
  getGapBetweenLevels(level) {
    return this.gapBetweenLevels
  }

  /**
   * Override this method if you want to have different alignments in different levels
   * @param {int} level
   */
  getAlignmentInLevel(level) {
    return this.alignment
  }

  /**
   * @param {LayoutNode} child
   * @param {LayoutNode} parent
   * @return {boolean}
   */
  isChildOfParent(child, parent) {
    return this.getChildren(parent).includes(child)
  }

  /**
   * @param {LayoutNode} node
   * @returns {LayoutNode}
   */
  getFirstChild(node) {
    let c = this.getChildren(node)
    return c[0]
  }

  /**
   * @param {LayoutNode} node
   * @returns {LayoutNode}
   */
  getLastChild(node) {
    let c = this.getChildren(node)
    return c[c.length - 1]
  }

  /**
   * @param {LayoutNode} node
   * @return {boolean}
   */
  isLeaf(node) {
    return this.getChildren(node).length === 0
  }

  /**
   * @param {LayoutNode} node
   * @param {boolean} returnWidth
   * @return {number}
   */
  getWidthOrHeightOfNode(node, returnWidth) {
    return returnWidth ? this.getNodeWidth(node) : this.getNodeHeight(node)
  }

  /**
   * Returns whether the level changes in Y-axis
   * (that is, when the root is placed at the top or the bottom of the overall bounding box)
   * @return {boolean}
   */
  inYAxis() {
    return this.rootPlacement === Placement.TOP || this.rootPlacement === Placement.BOTTOM
  }

  /**
   * Returns whether the level changes in X-axis
   * (that is, when the root is placed at the left or the right of the overall bounding box)
   * @return {boolean}
   */
  inXAxis() {
    return this.rootPlacement === Placement.LEFT || this.rootPlacement === Placement.RIGHT
  }

  /**
   * Returns -1 when the level changes from bottom to top or from right to left
   * Returns +1 when the level changes from top to bottom or from legt to right
   * @return {number}
   */
  getLevelChangeSign() {
    return this.rootPlacement === Placement.BOTTOM || this.rootPlacement === Placement.RIGHT ? -1 : 1
  }

  /**
   * When the root is located at the top or bottom the size of a level is the maximal height of the
   * nodes of that level. When the root is located at the left or right the size of a level is the
   * maximal width of the nodes of that level.
   * @param {LayoutNode} node
   * @param {int} level
   */
  calcMaxWidthsOrHeights(node, level) {
    if (this.maxSizePerLevel.length <= level) this.maxSizePerLevel.push(0)
    let size = this.getWidthOrHeightOfNode(node, this.inXAxis())
    if (this.maxSizePerLevel[level] < size) this.maxSizePerLevel[level] = size
    for (let child of this.getChildren(node)) {
      this.calcMaxWidthsOrHeights(child, level + 1)
    }
  }

  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getMod(node) {
    return this.mod[node] || 0
  }

  /**
   * @param {LayoutNode} node
   * @param {number} d
   */
  setMod(node, d) {
    this.mod[node] = d
  }

  /**
   * @param {LayoutNode} node
   * @returns {LayoutNode}
   */
  getThread(node) {
    return this.thread[node]
  }

  /**
   * @param {LayoutNode} node
   * @param {LayoutNode} thread
   */
  setThread(node, thread) {
    this.thread[node] = thread
  }

  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getPrelim(node) {
    return this.prelim[node] || 0
  }

  /**
   * @param {LayoutNode} node
   * @param {number} d
   */
  setPrelim(node, d) {
    this.prelim[node] = d
  }

  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getChange(node) {
    return this.change[node] || 0
  }

  /**
   * @param {LayoutNode} node
   * @param {number} d
   */
  setChange(node, d) {
    this.change[node] = d
  }

  /**
   * @param {LayoutNode} node
   * @returns {number}
   */
  getShift(node) {
    return this.shift[node] || 0
  }

  /**
   * @param {LayoutNode} node
   * @param {number} d
   */
  setShift(node, d) {
    this.shift[node] = d
  }

  /**
   * Returns the desired distance of the centers of both nodes
   * (depends on what getGapBetweenNeighbors() returns)
   * @param {LayoutNode} a
   * @param {LayoutNode} b
   * @returns {number} the distance between node a and b
   */
  getDistance(a, b) {
    let d = this.getWidthOrHeightOfNode(a, this.inYAxis()) + this.getWidthOrHeightOfNode(b, this.inYAxis())
    return d / 2 + this.getGapBetweenNeighbors(a, b)
  }

  /**
   * @param {LayoutNode} v
   * @return {LayoutNode}
   */
  nextLeft(v) {
    return this.isLeaf(v) ? this.getThread(v) : this.getFirstChild(v)
  }

  /**
   * @param {LayoutNode} v
   * @return {LayoutNode}
   */
  nextRight(v) {
    return this.isLeaf(v) ? this.getThread(v) : this.getLastChild(v)
  }

  /**
   * @param {LayoutNode} node
   * @param {LayoutNode} parentNode (parent of node)
   * @returns {int}
   */
  getNumber(node, parentNode) {
    let n = this.number[node]
    if (!n) {
      let i = 1
      for (let child of this.getChildren(parentNode)) {
        this.number[child] = i++
      }
      n = this.number[node]
    }
    return n
  }

  /**
   * Calculate the value that is used as first argument for moveTree()
   * Returns the 'greatest distinct ancestor' of vIMinus and its right neighbor
   * @param {LayoutNode} vIMinus
   * @param {LayoutNode} node
   * @param {LayoutNode} parent
   * @param {LayoutNode} leftMostSibling (a.k.a. 'defaultAncestor')
   * @return {LayoutNode}
   */
  wMinus(vIMinus, node, parent, leftMostSibling) {
    let leftNeighbor = this.leftNeighbor[node]
    if (!leftNeighbor) return node
    if (this.isChildOfParent(leftNeighbor, parent)) return leftNeighbor
    return leftMostSibling
  }

  /**
   * @param {LayoutNode} wMinus
   * @param {LayoutNode} wPlus
   * @param {LayoutNode} parent
   * @param {number} shift
   */
  moveSubtree(wMinus, wPlus, parent, shift) {
    let subtrees = this.getNumber(wPlus, parent) - this.getNumber(wMinus, parent)
    this.setChange(wPlus, this.getChange(wPlus) - shift / subtrees)
    this.setShift(wPlus, this.getShift(wPlus) + shift)
    this.setChange(wMinus, this.getChange(wMinus) + shift / subtrees)
    this.setPrelim(wPlus, this.getPrelim(wPlus) + shift)
    this.setMod(wPlus, this.getMod(wPlus) + shift)
  }

  /**
   * @param {LayoutNode} node
   * @param {LayoutNode} parent
   * @param {LayoutNode} leftMostSibling
   * @param {LayoutNode} [leftSibling]
   * @return {LayoutNode} what is now to be considered as leftMostSibling when apportion() is called again
   */
  apportion(node, parent, leftMostSibling, leftSibling) {
    if (!leftSibling) {
      // node has no left sibling
      return leftMostSibling
    }
    // node has left sibling w
    // The following variables "node..." are used to traverse the contours to the subtrees.
    // "Minus" refers to the left, "Plus" to the right subtree.
    // "I" refers to the "inside" and "O" to the outside contour.
    let vOPlus = node
    let vIPlus = node
    let vIMinus = leftSibling
    // get leftmost sibling of vIPlus, i.e. get the leftmost sibling of node,
    // i.e. the leftmost child of the parent of node (which is passed in)
    let vOMinus = this.getFirstChild(parent)
    let sIPlus = this.getMod(vIPlus)
    let sOPlus = this.getMod(vOPlus)
    let sIMinus = this.getMod(vIMinus)
    let sOMinus = this.getMod(vOMinus)
    let nextRightVIMinus = this.nextRight(vIMinus)
    let nextLeftVIPlus = this.nextLeft(vIPlus)
    while (nextRightVIMinus && nextLeftVIPlus) {
      vIMinus = nextRightVIMinus
      vIPlus = nextLeftVIPlus
      vOMinus = this.nextLeft(vOMinus)
      vOPlus = this.nextRight(vOPlus)
      this.leftNeighbor[vOPlus] = node
      let shift = (this.getPrelim(vIMinus) + sIMinus)
        - (this.getPrelim(vIPlus) + sIPlus)
        + this.getDistance(vIMinus, vIPlus)
      if (shift > 0) {
        this.moveSubtree(this.wMinus(vIMinus, node, parent, leftMostSibling), node, parent, shift)
        sIPlus = sIPlus + shift
        sOPlus = sOPlus + shift
      }
      sIMinus = sIMinus + this.getMod(vIMinus)
      sIPlus = sIPlus + this.getMod(vIPlus)
      sOMinus = sOMinus + this.getMod(vOMinus)
      sOPlus = sOPlus + this.getMod(vOPlus)
      nextRightVIMinus = this.nextRight(vIMinus)
      nextLeftVIPlus = this.nextLeft(vIPlus)
    }
    if (nextRightVIMinus && !this.nextRight(vOPlus)) {
      this.setThread(vOPlus, nextRightVIMinus)
      this.setMod(vOPlus, this.getMod(vOPlus) + sIMinus - sOPlus)
    }
    if (nextLeftVIPlus && !this.nextLeft(vOMinus)) {
      this.setThread(vOMinus, nextLeftVIPlus)
      this.setMod(vOMinus, this.getMod(vOMinus) + sIPlus - sOMinus)
      leftMostSibling = node
    }
    return leftMostSibling
  }

  /**
   * @param {LayoutNode} v
   */
  executeShifts(v) {
    let shift = 0, change = 0
    for (let w of this.getChildren(v).reverse()) {
      change = change + this.getChange(w)
      this.setPrelim(w, this.getPrelim(w) + shift)
      this.setMod(w, this.getMod(w) + shift)
      shift = shift + this.getShift(w) + change
    }
  }

  /**
   * In difference to the original algorithm we also pass in the leftSibling (see apportion())
   * @param {LayoutNode} node
   * @param {LayoutNode} [leftSibling]
   */
  firstWalk(node, leftSibling) {
    if (this.isLeaf(node)) {
      // No need to set prelim(node) to 0 as the getter takes care of this
      if (leftSibling) { // node has left sibling
        this.setPrelim(node, this.getPrelim(leftSibling) + this.getDistance(node, leftSibling))
      }
    } else { // node is not a leaf
      let previousChild = null, firstChild = this.getFirstChild(node)
      for (let w of this.getChildren(node)) {
        this.firstWalk(w, previousChild)
        firstChild = this.apportion(w, node, firstChild, previousChild)
        previousChild = w
      }
      this.executeShifts(node)
      let midpoint = (this.getPrelim(this.getFirstChild(node)) + this.getPrelim(this.getLastChild(node))) / 2
      if (leftSibling) { // node has left sibling
        this.setPrelim(node, this.getPrelim(leftSibling) + this.getDistance(node, leftSibling))
        this.setMod(node, this.getPrelim(node) - midpoint)
      } else { // node has no left sibling
        this.setPrelim(node, midpoint)
      }
    }
  }

  /**
   * In difference to the original algorithm we also pass in extra level information.
   * @param {LayoutNode} node
   * @param {number} offset // (m?)
   * @param {int} level
   * @param {int} levelStart
   */
  secondWalk(node, offset, level, levelStart) {
    // construct the position from the prelim and the level information
    // The placement of the root node affects the way how x and y are changed and in what direction.
    let levelChangeSign = this.getLevelChangeSign()
    let levelSize = this.maxSizePerLevel[level]
    let y, x = this.getPrelim(node) + offset
    switch (this.getAlignmentInLevel(level)) {
      case Alignment.CENTER:
        y = levelStart + levelChangeSign * (levelSize / 2)
        break
      case Alignment.TOWARDS_ROOT:
        y = levelStart + levelChangeSign * (this.getWidthOrHeightOfNode(node, this.inXAxis()) / 2)
        break
      case Alignment.AWAY_FROM_ROOT:
        y = levelStart + levelSize - levelChangeSign * (this.getWidthOrHeightOfNode(node, this.inXAxis()) / 2)
        break
    }
    if (this.inYAxis()) {
      this.positions.push([node, x, y])
    } else { // inXAxis
      this.positions.push([node, y, x])
    }
    if (!this.isLeaf(node)) {
      let nextLevelStart = levelStart
        + (levelSize + this.getGapBetweenLevels(level + 1))
        * levelChangeSign
      for (let w of this.getChildren(node)) {
        this.secondWalk(w, offset + this.getMod(node), level + 1, nextLevelStart)
      }
    }
  }

  /**
   * Creates a TreeLayout object (only to be used once)
   * @param {LayoutNode} root
   * @param {number} gapBetweenNeighbors
   * @param {number} gapBetweenLevels
   * @param {Placement} rootPlacement
   * @param {Alignment} alignment
   */
  constructor(root, gapBetweenNeighbors, gapBetweenLevels, rootPlacement, alignment) {
    super()
    this.alignment = alignment
    this.rootPlacement = rootPlacement
    this.gapBetweenLevels = gapBetweenLevels
    this.gapBetweenNeighbors = gapBetweenNeighbors
    // the following attributes are changed while the layout algorithm runs, getters provide default values
    this.mod = {}
    this.thread = {}
    this.prelim = {}
    this.change = {}
    this.shift = {}
    this.number = {}
    // those attributes are also changed during the layouting process, but don't have getters/setters
    this.leftNeighbor = {} // in some literature called 'ancestor', quasi (!) either left sibling or cousin (?)
    this.maxSizePerLevel = [] // max width or hight depending on inXAxis()/inYAxis()
    this.positions = [] // the results are written into this array: triples with node, relative x, relative y
    // perform walks (the class is meant to be instantiatet once per call of layout() only)
    this.firstWalk(root)
    this.calcMaxWidthsOrHeights(root, 0)
    this.secondWalk(root, -this.getPrelim(root), 0, 0)
  }
}

/**
 * Alignment of Nodes relative to their descendends
 * @enum
 */
export const Alignment = {CENTER: 0, TOWARDS_ROOT: 1, AWAY_FROM_ROOT: 2}
/**
 * Placement within the bounding box of the entire tree (aka side of the rectangle)
 * @enum
 */
export const Placement = {TOP: 0, LEFT: 1, BOTTOM: 2, RIGHT: 3}

/**
 * Applies Compact Tree Layout Algorithm
 * Updates the bounding boxes of the tree nodes
 * Returns the bounding box of the entire tree
 * @param {LayoutNode} root
 * @param {number} [neighborGap] how much space should be between different neighbors
 * @param {number} [levelGap] how much space should be between different levels
 * @param {Placement} [placeRoot] where to place the root node within the bounds of the entire tree
 * @param {Alignment} [alignment] how to align nodes within a level when there is space left and right
 * @return {Box}
 */
export function layout(root, neighborGap = 1, levelGap = 1, placeRoot = Placement.TOP, alignment = Alignment.CENTER) {
  let t = new TreeLayout(root, neighborGap, levelGap, placeRoot, alignment), p = t.positions
  let treeMinX = +Infinity, treeMinY = +Infinity, treeMaxX = -Infinity, treeMaxY = -Infinity
  for (let i = 0, len = p.length; i < len; i++) {
    /** @type{Component} */
    let node = p[i][0]
    let cx = p[i][1]
    let cy = p[i][2]
    let w = t.getNodeWidth(node) / 2
    let h = t.getNodeHeight(node) / 2
    let nodeMinX = cx - w, nodeMinY = cy - h, nodeMaxX = cx + w, nodeMaxY = cy + h
    node._bb = [[nodeMinX, nodeMinY], [nodeMaxX, nodeMaxY]]
    node._layout_done = true
    if (nodeMinX < treeMinX) treeMinX = nodeMinX
    if (nodeMinY < treeMinY) treeMinY = nodeMinY
    if (nodeMaxX > treeMaxX) treeMaxX = nodeMaxX
    if (nodeMaxY > treeMaxY) treeMaxY = nodeMaxY
  }
  return [[treeMinX, treeMinY], [treeMaxX, treeMaxY]]
}
