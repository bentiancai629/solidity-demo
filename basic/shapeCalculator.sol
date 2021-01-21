pragma solidity ^0.4.0;

/** @title 形状计算器。 */
contract shapeCalculator {
    /** @dev 求矩形表明面积与周长。
    * @param w 矩形宽度。
    * @param h 矩形高度。
    * @return s 求得表面积。
    * @return p 求得周长。
    */
    function rectangle(uint w, uint h) returns (uint s, uint p) {
        s = w * h;
        p = 2 * (w + h);
    }
}