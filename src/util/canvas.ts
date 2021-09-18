export const asyncLoadImg = (src: string) => {
    const imgObj = new Image();
    imgObj.setAttribute('crossOrigin', '*');
    imgObj.crossOrigin = 'Anonymous';
    imgObj.src = src;
    return new Promise((resolve, reject) => {
      imgObj.onload = () => {
        resolve(imgObj);
      };
      imgObj.onerror = reject;
    });
  };
  /**
 * 等比缩放
 * @param wrap 外容器
 * @param container 等比例缩放容器
 * @returns {{width: number, height: number}}
 * 返回值：width:比例宽度, height:比例高度
 */
export const aspectRatio = (wrap: DOMRect, container: DOMRect, padding = 30) => {
    // w:h = w1:h1 =>
    // w1 = rc*h1
    let wrapW = wrap.width;
    let wrapH = wrap.height;
    const rw = wrapW / wrapH;
    let cW = container.width;
    let cH = container.height;
    const rc = cW / cH;
  
    if (rc > 1) {
      wrapW -= padding;
      wrapH = wrapW / rw;
  
      cW = wrapW;
      cH = wrapW / rc;
      if (cH > wrapH) { // 超过容器高度的情况
        cH = wrapH;
        cW = rc * cH;
      }
    } else if (rc < 1) { // w:h = w1:h1 => w1 = rc*h1
      wrapH -= padding;
      wrapW = wrapH * rw;
      cH = wrapH;
      cW = rc * cH;
      if (cW > wrapW) { // 超过容器宽度的情况
        cW = wrapW;
        cH = wrapW / rc;
      }
    } else if (rc === 1) {
      wrapH -= padding;
      wrapW = wrapH * rw;
      cH = wrapH;
      cW = rc * cH;
      const v = wrapW > wrapH ? wrapH : wrapW;
      cH = v;
      cW = v;
    }
  
    return {
      width: cW,
      height: cH,
    };
  };
  