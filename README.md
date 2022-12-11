
# Infinite Page and Tracker

In-page counting and infinite resource addition project

# Options

..and inline options => index.html


```sh
const InfiniteTracker = new IT({
    "api": "/infinite.html?id=",
    "data": [{
        "nextNewsID": "0000006",
        "nextNewsURL": "/test-test-0000006",
        "nextNewsTitle": "Test article",
        "nextNewsImg": "https://imgapi.com/img.png"
    },{
        "nextNewsID": "0000007",
        "nextNewsURL": "/test-test-0000007",
        "nextNewsTitle": "Test article",
        "nextNewsImg": "https://imgapi.com/img.png"
    }],
    "trackers": {
        "google": function (data) {
            console.log("google", data);
        },
        "gemius": function (data) {
            console.log("gemius", data);
        }
    },
    "history": true, //default true
    "infiniteCallback": function () {
        console.log("callback test");
    }
});
InfiniteTracker.init();
```