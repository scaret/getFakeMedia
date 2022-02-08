export const autoplayBanner = document.createElement("h1")
autoplayBanner.innerText = "受浏览器自动播放策略影响，需点击此处以恢复播放"

autoplayBanner.style.position = "fixed";
autoplayBanner.style.background = "yellow";
autoplayBanner.style.top = "0";
autoplayBanner.style.width = "100%"

export const showAutoPlayBanner = ()=>{
    document.body.appendChild(autoplayBanner)
}

export const hideAutoPlayBanner = ()=>{
    autoplayBanner.parentNode?.removeChild(autoplayBanner)
}

autoplayBanner.onclick = hideAutoPlayBanner



