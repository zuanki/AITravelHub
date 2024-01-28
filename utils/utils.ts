function formatLink(link: string) {
    return link.replace(/(\d+)x(\d+)!/, "0x0!").replace("/1000/", "/0x0!/");
}

export { formatLink };