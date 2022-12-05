class IT {
    constructor(props) {
        const defaults = {
            'attr': 'data-it',
            'container': '.it-container',
            'mainSection': '.it-main',
            'section': '.it-item',
            'loading': '.it-loading-progress',
            'active': 'it-active',
        };
        this.options = Object.assign(defaults, props);
        this.scrollTemp = 0;
        this.selectedItem,
            this.nextItemUrl,
            this.requestStarted = false,
            this.infiniteIndex = 0;
    }

    isInView(el) {
        const boundsTop = el.getBoundingClientRect().top;
        const bounds = {
            top: boundsTop
        };
        return bounds.top <= (window.innerHeight || document.body.clientHeight) / 2;
    }

    google(data) {
        window.dataLayer = window.dataLayer || [];
        dataLayer.push({

        });
    }

    gemius(data) {

    }

    history(data) {

        const state = { 'scrollY': this.scrollTemp }

        let url = "";
        if (data.parameter == "full") {
            url = data.url;
        } else {
            const mainItemHistory = JSON.parse(this.mainItem.getAttribute(this.options.attr)).tracker.filter(e => e.type === "history");

            url = new URL(mainItemHistory[0].url, window.location);
            url.searchParams.set(data.parameter, data.url);
        }

        history.pushState(state, data.title, url);

    }

    trackers() {
        const trackers = JSON.parse(this.selectedItem.getAttribute(this.options.attr)).tracker;

        this.log(JSON.parse(this.selectedItem.getAttribute(this.options.attr)).index);

        for (let i = 0, length = trackers.length; i < length; i++) {
            const tracker = trackers[i];

            switch (tracker.type) {
                case "google":
                    this.google(tracker);
                    break;
                case "gemius":
                    this.gemius(tracker);
                    break;
                case "history":
                    this.history(tracker);
                    break;
                default:
                    break;
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

                if (JSON.parse(attributes).next) {
                    nextUrl = JSON.parse(attributes).next;
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
        // const data = await fetch(url)
        const data = await fetch('/infinite.html')
            .then((response) => response.text())
            .then((html) => _this.append(html));
    }

    infinite() {
        const loadingEl = document.querySelector(this.options.loading);
        const boundsTop = loadingEl.offsetTop;
        const clientHeight = (window.innerHeight || document.body.clientHeight);

        if ((this.nextItemUrl || this.options.data) && boundsTop <= this.scrollTemp + clientHeight && !this.requestStarted) {
            const url = this.nextItemUrl != "stop" ? this.nextItemUrl :
                this.options.api ? this.options.api + this.options.data[this.infiniteIndex].nextNewsID : 0;
            this.getRequest(url);
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

    log(msg) {
        console.log(msg);
        document.getElementById('it-log').innerHTML = msg;
    }
}

const InfiniteTracker = new IT({
    // "api": "https://www.api.com/infiniteload/",
    // "data": [{
    //     "nextNewsID": "0000000",
    //     "nextNewsURL": "/test-test-02154",
    //     "nextNewsTitle": "Test article",
    //     "nextNewsImg": "https://imgapi.com/img.png"
    // }],
});
InfiniteTracker.init();