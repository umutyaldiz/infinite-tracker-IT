class IT {
    constructor(props) {
        const defaults = {
            'attr': 'data-it',
            'container': '.it-container',
            'mainSection': '.it-main',
            'section': '.it-item',
            'loading': '.it-loading-progress',
            'active': 'it-active',
            "history": true
        };
        this.options = Object.assign(defaults, props);
        this.scrollTemp = 0;
        this.selectedItem,
            this.nextItemUrl,
            this.requestStarted = false,
            this.infiniteIndex = 0,
            this.loadedPageIDS = [];
    }

    isInView(el) {
        const boundsTop = el.getBoundingClientRect().top;
        const bounds = {
            top: boundsTop
        };
        return bounds.top <= (window.innerHeight || document.body.clientHeight) / 2;
    }

    history(data) {

        const state = { 'scrollY': this.scrollTemp }

        let url = "";
        if (data.parameter == "full") {
            url = data.url;
        } else if (data.parameter == "/") {
            const mainItemHistory = JSON.parse(this.mainItem.getAttribute(this.options.attr)).tracker
                .filter(e => e.type === "history");
            url = mainItemHistory[0].url + data.parameter + data.url;
        } else {
            const mainItemHistory = JSON.parse(this.mainItem.getAttribute(this.options.attr)).tracker
                .filter(e => e.type === "history");
            url = new URL(mainItemHistory[0].url, window.location);
            url.searchParams.set(data.parameter, data.url);
        }
        if(url && window.location.pathname != url){
            history.pushState(state, data.title, url);
        }

    }

    trackers() {
        const trackers = JSON.parse(this.selectedItem.getAttribute(this.options.attr)).tracker;

        if (this.options.history) {
            const historyCheck = trackers.filter(e => e.type === "history");
            if (historyCheck.length) {
                this.history(historyCheck[0]);
            }
        }

        const filteredTrackers = trackers.filter(e => e.type != "history"); //history not a function
        for (let i = 0, length = filteredTrackers.length; i < length; i++) {
            const tracker = filteredTrackers[i];
            if (this.options.trackers) {
                this.options.trackers[tracker.type](tracker)
            }
        }

    }

    activeItem() {
        const sections = document.querySelectorAll(this.options.section);
        let wrapperItem,
            nextUrl,
            newItem;
        for (let i = 0, length = sections.length; i < length; i++) {
            const item = sections[i];
            const attributes = item.getAttribute(this.options.attr);

            item.classList.remove(this.options.active);

            if (this.isInView(item)) {
                newItem = item;

                if (JSON.parse(attributes).next || item.classList.contains(this.options.mainSection.replace('.', ''))) {
                    nextUrl = JSON.parse(attributes).next || 0;
                    wrapperItem = item;
                }
            }

        }

        if (newItem) {
            if (this.selectedItem != newItem) {
                this.selectedItem = newItem;
                this.nextItemUrl = nextUrl;
                this.mainItem = wrapperItem;

                this.trackers();
            }
            this.selectedItem.classList.add(this.options.active);
        }
    }

    append(html) {
        const _this = this;

        const container = document.querySelector(this.options.container);
        container.insertAdjacentHTML('beforeend', html);

        const mainSections = document.querySelectorAll(this.options.mainSection);

        var codes = mainSections[mainSections.length - 1].getElementsByTagName("script");
        for (var i = 0; i < codes.length; i++) {
            eval(codes[i].text);
        }

        setTimeout(() => {
            _this.requestStarted = false;
            if (this.options.infiniteCallback) {
                this.options.infiniteCallback();
            }
        }, 1000);
    }

    async getRequest(url) {
        const _this = this;
        this.requestStarted = true;
        if (!url) {
            const loadingEl = document.querySelector(this.options.loading);
            loadingEl.style = "display:none";
            return;
        }

        try {
            await fetch(url).then((response) => response.text()).then((html) => {
                _this.append(html);
            }).catch((error) => {
                const loadingEl = document.querySelector(this.options.loading);
                loadingEl.style = "display:none";
            });
        } catch (error) {
            const loadingEl = document.querySelector(this.options.loading);
            loadingEl.style = "display:none";
        }
    }

    infinite() {
        const loadingEl = document.querySelector(this.options.loading);
        const boundsTop = loadingEl.offsetTop;
        const clientHeight = (window.innerHeight || document.body.clientHeight);

        if ((this.nextItemUrl || this.options.data)
            && boundsTop <= this.scrollTemp + clientHeight
            && !this.requestStarted) {

            let urlSet = 0;

            if (this.options.api) {
                let news = this.options.data[this.infiniteIndex];
                if (news) {
                    let newsID = this.options.data[this.infiniteIndex].nextNewsID;

                    if (this.loadedPageIDS.indexOf(newsID) > -1) {
                        this.infiniteIndex++;
                        newsID = this.options.data[this.infiniteIndex].nextNewsID;
                    } else {
                        this.loadedPageIDS.push(newsID);
                    }

                    urlSet = this.options.api + newsID;
                }
            } else if (this.nextItemUrl != "stop") {
                urlSet = this.nextItemUrl;
            }

            this.infiniteIndex++;
            this.getRequest(urlSet);

        }

    }

    scrollHandler() {
        this.scrollTop = window.scrollY || window.pageYOffset;

        this.scrollTemp = this.scrollTop;
        this.activeItem();
        this.infinite();
    }

    setBaseLocation() {
        this.baseLocation = {
            "host": window.location.host,
            "hostname": window.location.hostname,
            "href": window.location.href,
            "origin": window.location.origin,
            "pathname": window.location.pathname
        }
    }

    init() {
        const _this = this;
        _this.setBaseLocation();

        _this.scrollHandler();
        addEventListener('scroll', (event) => {
            _this.scrollHandler();
        });
    }
}

const InfiniteTracker = new IT({
    // "api": "/infinite.html?id=",
    // "data": [{
    //     "nextNewsID": "0000006",
    //     "nextNewsURL": "/test-test-0000006",
    //     "nextNewsTitle": "Test article",
    //     "nextNewsImg": "https://imgapi.com/img.png"
    // },{
    //     "nextNewsID": "0000007",
    //     "nextNewsURL": "/test-test-0000007",
    //     "nextNewsTitle": "Test article",
    //     "nextNewsImg": "https://imgapi.com/img.png"
    // }],
    "trackers": {
        "google": function (data) {
            console.log("google", data);
        },
        "gemius": function (data) {
            console.log("gemius", data);
        }
    },
    "history": true,//default true
    "infiniteCallback": function () {
        console.log("callback test");
    }
});
InfiniteTracker.init();