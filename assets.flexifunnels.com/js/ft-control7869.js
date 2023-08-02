var FUNNEL_ID = document.head.querySelector("meta[name=funnel_id]").content;
var FUNNEL_PAGE_ID = document.head.querySelector(
    "meta[name=funnel_page_id]"
).content;
var BASE_URL = "https://api.myflxfnls.com";
var path = new URL(document.location);
var params = path.searchParams;
var ai = params.get("ai"),
    pi = params.get("pi"),
    ti = params.get("ti"),
    fid = params.get("fid"),
    product_id = params.get("id"),
    ffid = params.get("ffid");

getCookie = function (cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == " ") {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
};
delete_cookie = function (name) {
    document.cookie = name + "=; Path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
};
delete_cookies = function (clist) {
    clist.forEach(function (key) {
        document.cookie =
            key + "=; Path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    });
};
setCookie = function (clist) {
    clist.forEach(function (item, index) {
        document.cookie =
            item.key +
            "=" +
            item.value +
            "; path=/; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    });
};
// getTimerDate = function (t, offset) {
//     now = new Date();
//     local_time = now.getTime();
//     local_offset = now.getTimezoneOffset() * 60000;
//     utc = local_time + local_offset;
//     return new Date(utc + 3600000 * offset);
// };
getTimerDate = function (t, offset) {
    var d = t ? new Date(t) : new Date();
    var localTime = d.getTime();
    var localOffset = d.getTimezoneOffset() * 60000;
    var utc = localTime + localOffset;
    var timer_res = utc + 3600000 * offset;
    return new Date(timer_res);
};
generateUniqueId = function (event) {
    return `_${Date.now().toString(36)}${Math.floor(
        Number.MAX_SAFE_INTEGER * Math.random()
    ).toString(36)}`;
};
var utmkeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "utm_id",
];

getUTMtracking = function (params, data, utmId) {
    var utm_s = params.get("utm_source");
    if (utm_s != null) {
        utmkeys.forEach(function (number) {
            var t = params.get(number);
            if (t != null) data[number] = t;
        });

        var utm_count = getCookie("utm_count_" + utmId);
        var utm_ad = getCookie("utm_append_" + utmId);

        data["touch_point"] = utm_count;
        data["utm_flow"] = utm_ad;
    }
    return data;
};
setUTMtracking = function (params, utmId) {
    var utm = params.get("utm_source");
    if (utm != null) {
        var utmObj = {};
        utmkeys.forEach(function (number) {
            var t = params.get(number);
            if (t != null) utmObj[number] = t;
        });

        var lutm = getCookie("lus_" + utmId);
        console.log(utm);
        var utm_count = 0;
        var utm_append = "";
        if (lutm !== "" && lutm != utm) {
            utmObj["lus"] = lutm;
            var utm_count_in = getCookie("utm_count_" + utmId);

            utm_count = parseInt(getCookie("utm_count_" + utmId)) + 1;
            console.log(JSON.parse(getCookie("utm_append_" + utmId)));
            var newUTM = JSON.parse(getCookie("utm_append_" + utmId));
            console.log(newUTM);
            newUTM.push(utm);
            console.log(utm);
            console.log(newUTM);
            utm_append = newUTM;
        } else if (lutm !== "" && lutm == utm) {
            utm_count = parseInt(getCookie("utm_count_" + utmId));
            utm_append = JSON.parse(getCookie("utm_append_" + utmId));
        } else {
            utm_count = 1;
            utm_append = [utm];
            console.log(utm_append);
        }

        setCookie([
            {
                key: "utag_main_" + utmId,
                value: JSON.stringify(utmObj),
            },
            {
                key: "ft_params_" + utmId,
                value: params.toString(),
            },
            {
                key: "lus_" + utmId,
                value: utmObj.utm_source,
            },
            {
                key: "lus_utm_id_" + utmId,
                value: utmObj.utm_id,
            },
            //UTM Count
            {
                key: "utm_count_" + utmId,
                value: utm_count,
            },
            //UTM append
            {
                key: "utm_append_" + utmId,
                value: JSON.stringify(utm_append),
            },
        ]);
    }
    //return res;
};

$(document).ready(function () {
    callHTTP = function (
        url,
        data,
        callback, // How can I use this callback?,
        type
    ) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            // if (xhr.readyState == 4) {
            callback(this); // Another callback here
            // }
        };
        xhr.open(type ? type : "POST", url);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

        //  xhr.setRequestHeader("authorizationToken", path.host);

        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(data);
    };

    mailValidation = function (val) {
        var expr =
            /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

        var mode = false;
        if (!expr.test(val)) mode = true;
        if (val.includes("+")) mode = false;
        return mode;
    };

    validatePhone = function (phone) {
        if (typeof phone == "undefined") return true;
        var regex = /^\+(?:[0-9] ?){6,14}[0-9]$/;
        if (regex.test(phone)) {
            return true;
        } else {
            return false;
        }
    };

    formvalidation = function (formId, $formData) {
        var fail = false;
        var errList = {};
        formErrMsgShowUp(formId, {});

        function inputValidation(obj, name, value, errList) {
            if (name == "email") {
                value.trim().replaceAll(" ", "");
                if (mailValidation(value)) {
                    obj.addClass("gjs-ip-brdrclr");
                    fail = true;
                    errList.email = ["Please enter a valid email address"];
                }
            } else if (name == "phone") {
                var mode = obj.attr("data-tel-mode")
                    ? obj.attr("data-tel-mode")
                    : "true";
                if (mode == "true") {
                    $formData[name] = obj.attr("data-tel-no")
                        ? obj.attr("data-tel-no")
                        : value;
                    var dialcode = obj.attr("data-tel-countrycode");
                    if (!verifier(dialcode))
                        $formData["ft_countrycode"] = dialcode;
                } else if (mode == "false") {
                    obj.addClass("gjs-ip-brdrclr");
                    fail = true;
                    errList.phone = [
                        obj.attr("data-tel-err")
                            ? obj.attr("data-tel-err")
                            : "Please enter a valid phone number",
                    ];
                }
                // if (!phonenumber(value)) {
                //     obj.addClass("gjs-ip-brdrclr");
                //     fail = true;
                //     errList.phone = ["Please enter a valid phone number"];
                // }
            }
        }

        $("#" + formId)
            .find("select, textarea, input")
            .each(function () {
                var name = $(this).attr("name");
                var value = $(this).val().trim();

                if (name == "pricing_id") {
                    var price = $(
                        "input[name=pricing_id]:checked",
                        "#" + formId
                    ).val();

                    if (verifier(price)) {
                        errList.pricing_id = [
                            "Please select at least one pricing option",
                        ];
                        fail = true;
                    }
                }

                $(this).removeClass("gjs-ip-brdrclr");
                if ($(this).prop("required")) {
                    // If input require
                    if (!value) {
                        let dataRequired = $(this).attr("data-required"); //For autoResponder code
                        if (dataRequired == "false") {
                        } else {
                            fail = true;
                            $(this).addClass("gjs-ip-brdrclr");
                            errList["empty"] = [
                                "Please fill in all the required fields",
                            ];
                        }
                    } else inputValidation($(this), name, value, errList);
                } else if (value) {
                    inputValidation($(this), name, value, errList);
                }
            });

        //submit if fail never got set to true
        if (fail) formErrMsgShowUp(formId, errList);
        var res = { fail: !fail, formData: $formData };
        return res;
    };

    // function ftButton(sId, hId) {
    //     (document.getElementById(sId).style.display = "inline-block"),
    //         (document.getElementById(hId).style.display = "none");
    // }
    //commonGetInputs
    verifier = function (value) {
        return (
            value === undefined ||
            value === null ||
            (typeof value === "object" && Object.keys(value).length === 0) ||
            (typeof value === "string" && value.trim().length === 0)
        );
    };
    getAssignedData = function ($dataObject) {
        if (!verifier($('input[name="product_id"]').val()))
            $dataObject["product_id"] = $('input[name="product_id"]').val();
        if (!verifier($('input[name="ffid"]').val()))
            $dataObject["ffid"] = $('input[name="ffid"]').val();
        if (!verifier($('input[name="fid"]').val()))
            $dataObject["fid"] = $('input[name="fid"]').val();
        return $dataObject;
    };
    btnLoader = function (obj, pObj) {
        var temp = obj.find(".fa-spin");
        if (temp.length != 0) return false;
        if (pObj) pObj.addClass("gjs-btneffect");
        else obj.addClass("gjs-btneffect");
        obj.append(`<i class="fas fa-spinner fa-spin ml-1"></i>`);
        return true;
    };
    removebtnLoader = function (obj, pObj) {
        setTimeout(function () {
            if (pObj) pObj.removeClass("gjs-btneffect");
            else obj.removeClass("gjs-btneffect");
            obj.find(".fa-spin").remove();
        }, 1200);
    };
    getAllFormsData = function ($dataObject) {
        $("body")
            .find("form")
            .each(function (index) {
                $fData = $(this).serializeArray();
                $fData.map(function (val) {
                    $dataObject[val.name] = val.value;
                });
            });
        return $dataObject;
    };
    formSucssMsgShowUp = function (formId, curObj, msg) {
        setTimeout(function () {
            curObj.removeClass("skeleton-loader");
            //curObj.removeClass("gjs-btneffect");
            // curObj.find(".fa-spin").fadeOut("slow", function () {
            //     $(this).remove();
            // });
            curObj.find(".fa-spin").remove();
        }, 500);

        var fObj = $("#" + formId);
        if (fObj) {
            fObj[0].reset();
            if (!verifier(msg)) {
                fObj.find(".ft-formsuc-block").remove();
                fObj.find(".ft-formerr-block").remove();

                var html = `<div class="ft-formsuc-block ft-fadein">
                    <span>${msg}</span>
                    <button type="button" class="close formsuc-close">
                    <span>×</span>
                    </button>
                </div>`;
                fObj.prepend(html);
            }
        }
    };
    actionUrlCheck = function (url) {
        try {
            let domain = new URL(url);
            domain = domain.hostname.replace("www.", "");
            return domain;
        } catch (err) {
            return false;
        }
    };
    getUA = function () {
        let device = "Unknown";
        const ua = {
            "Generic Linux": /Linux/i,
            Android: /Android/i,
            BlackBerry: /BlackBerry/i,
            Bluebird: /EF500/i,
            "Chrome OS": /CrOS/i,
            Datalogic: /DL-AXIS/i,
            Honeywell: /CT50/i,
            iPad: /iPad/i,
            iPhone: /iPhone/i,
            iPod: /iPod/i,
            macOS: /Macintosh/i,
            Windows: /IEMobile|Windows/i,
            Zebra: /TC70|TC55/i,
        };
        Object.keys(ua).map(
            (v) => navigator.userAgent.match(ua[v]) && (device = v)
        );
        return device;
    };
    formErrMsgShowUp = function (formId, fErr, curObj) {
        document.querySelector("#" + formId).scrollIntoView({
            behavior: "smooth",
        });
        if (curObj) {
            setTimeout(function () {
                curObj.removeClass("skeleton-loader");
            }, 0);
        }

        var tArray = [];
        Object.keys(fErr).forEach(function (key, value) {
            var res = {
                type: key,
                msg: fErr[key][0],
            };
            tArray.push(res);
        });

        var fObj = $("#" + formId);
        if (fObj) {
            fObj.find(".ft-formsuc-block").remove();
            fObj.find(".ft-formerr-block").remove();
            //fObj.find(".gjs-ip-brdrclr").removeClass("gjs-ip-brdrclr");

            if (tArray.length != 0) {
                var liInner = ``;
                tArray.forEach(function (item, index) {
                    fObj.find(`input[name=${item.type}]`).addClass(
                        "gjs-ip-brdrclr"
                    );
                    liInner += `<li>${item.msg}</li>`;
                });

                var html = `<div class="ft-formerr-block"><ul>${liInner}</ul></div>`;
                fObj.prepend(html);
            }
        }
    };

    $(document).on(
        "click",
        "img[data-action='url'],.ft-icon[data-action='url']",
        function () {
            ($url = $(this).attr("data-url")),
                ($target = $(this).attr("data-target")
                    ? $(this).attr("data-target")
                    : "_self"),
                window.open($url, $target);
        }
    ),
        ($climg = $("img[data-action='calls'],.ft-icon[data-action='calls']")),
        $climg.each(function () {
            $url = $(this).attr("href");
            $(this).wrap(`<a href="${$url}"></a>`);
        }),
        $(document).on(
            "click",
            "img[data-action='popup'],.ft-icon[data-action='popup']",
            function () {
                var pop_id = $(this).attr("data-popup");
                $("#" + pop_id).addClass("show");
            }
        ),
        $(document).on("click", ".ff-modal-pop-close", function (event) {
            event.stopPropagation();
            var id = $(this).attr("data-popid");
            $("#" + id)
                .find(".ff-modal-div")
                .addClass("fmc-ani-down")
                .delay(300)
                .queue(function () {
                    $(this).removeClass("fmc-ani-down").dequeue();
                });
            setTimeout(function () {
                var pObj = $("#" + id);
                if (pObj.length !== 0) {
                    pObj.removeClass("show");
                    addCookieToPopup(pObj);
                }
            }, 250);
        }),
        $(document).on("click", "div[data-popupbgclose='yes']", function () {
            $(this).removeClass("show");
            addCookieToPopup($(this));
        }),
        $(document).on(
            "click",
            "div[data-popupbgclose='no']",
            function (event) {
                // alert();
                // $(this).find('.ff-modal-div').addClass("fmc-scale").delay(1000).removeClass("fmc-scale");

                $(this)
                    .find(".ff-modal-div")
                    .addClass("fmc-scale")
                    .delay(100)
                    .queue(function () {
                        $(this).removeClass("fmc-scale").dequeue();
                    });
            }
        ),
        $(document).on("click", ".ff-modal-content", function (event) {
            event.stopPropagation();
        }),
        $(document).on("click", "a[href*='#open-popup']", function () {
            ($id = $(this).attr("data-popup")), $("#" + $id).addClass("show");
            return false;
        }),
        $(document).on("click", ".formsuc-close", function () {
            $(this).parent().fadeOut();
        }),
        // *******************************************
        // popup start close
        // ********************************************

        // ***********
        // Nav start
        // ***********
        $(document).on("click", ".ft-navbar-toggler", function () {
            $sticky = $(".ft-stickytop").first();
            if ($sticky.length != 0) $sticky.addClass("ft-stickytop-box");
            $(this).next().toggleClass("show");
        }),
        // $(".ft-dropdown").hover(
        //     function () {
        //         var color = $(this).css("background-color");
        //         $(this).prev().css("background-color", color);
        //     },
        //     function () {
        //         $(this).prev().removeAttr("style");
        //     }
        // ),
        // ***********
        // Nav close
        // ***********

        $(document).on(
            "click",
            "a[href*='#scroll-'],img[data-imagelink*='#scroll-'],.ft-icon[data-imagelink*='#scroll-']",
            function () {
                $id = $(this).attr("data-ftscrollid");
                if (typeof $id !== "undefined") {
                    var top = $("#" + $id).offset().top;
                    $([document.documentElement])
                        .stop()
                        .animate(
                            {
                                scrollTop: top,
                            },
                            {
                                done: function () {
                                    var itop = $("#" + $id).offset().top;
                                    if (top !== itop) {
                                        $([document.documentElement])
                                            .stop()
                                            .animate(
                                                {
                                                    scrollTop: itop,
                                                },
                                                100
                                            );
                                    }
                                },
                                duration: 500,
                            }
                        );
                }
                return false;
            }
        ),
        $(document).on("click", "a[href*='#product']", function () {
            var curObj = $(this);
            $product_id = $(this).attr("data-ft-productData");
            // ($checkout_url = $(this).attr("data-checkout-url"));
            //if (!verifier($checkout_url)) window.location.href = $checkout_url;
            // else {
            if ($(curObj).hasClass("skeleton-loader")) return false;
            curObj.addClass("skeleton-loader");

            $newObject = {
                product_id: $product_id ? $product_id : "",
                type: "product",
            };
            var data = JSON.stringify($newObject);
            callHTTP(BASE_URL + "/checkout", data, function (res) {
                if (res.readyState === 4) {
                    curObj.removeClass("skeleton-loader");
                    var response = JSON.parse(res.responseText);
                    window.location.href = response.body.checkout_page_url;
                }
            });
            //}
            return !1;
        }),
        $(document).on("click", "a[href*='#funnel']", function () {
            var curObj = $(this);
            if ($(curObj).hasClass("skeleton-loader")) return false;
            curObj.addClass("skeleton-loader");

            // var btnApp = $(this).find(".ffbtntxt");
            // if (!btnLoader(btnApp, curObj)) return false; //Multi Acation prevent

            ($product_id = $(this).attr("data-ft-productData")),
                ($type =
                    $(this).attr("href") == "#funnel" ? "funnel" : "product"),
                ($funnel_id = $(this).attr("data-ft-funnelData")),
                ($funnel_product_id = $(this).attr("data-funnel_product_id"));

            $newObject = {
                product_id: $product_id ? $product_id : "",
                funnel_id: $funnel_id ? $funnel_id : "",
                funnel_product_id: $funnel_product_id ? $funnel_product_id : "",
                type: $type,
            };
            var data = JSON.stringify($newObject);

            callHTTP(BASE_URL + "/checkout", data, function (res) {
                if (res.readyState === 4) {
                    curObj.removeClass("skeleton-loader");
                    var response = JSON.parse(res.responseText);
                    window.location.href = response.body.checkout_page_url;
                }
            });

            // var xhr = new XMLHttpRequest();

            // xhr.addEventListener("readystatechange", function () {
            //     if (this.readyState === 4) {
            //         // removebtnLoader(btnApp, curObj); //remove loader after res
            //         curObj.removeClass("skeleton-loader");

            //         console.log(this.responseText);
            //         console.log(typeof this.responseText);
            //         var response = JSON.parse(this.responseText);
            //         // console.log(this.getResponseHeader('Set-Cookie'));
            //         // window.location.href = response.checkout_page_url + "?id=" + response.product_id;
            //         window.location.href = response.body.checkout_page_url;

            //         // curObj.removeClass("gjs-btneffect");
            //         // curObj.find(".fa-spin").remove();
            //     }
            // });

            // xhr.open("POST", "https://dev.myflxfnls.com/checkout");
            // xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            // xhr.setRequestHeader("authorizationToken", path.host);
            // xhr.setRequestHeader("Content-Type", "application/json");

            // xhr.send(data);
            return !1;
        }),
        //No thanks button
        $(document).on("click", "a[href*='#no-thanks']", function () {
            var curObj = $(this);
            $dataObject = {
                product_id: $(this).attr("data-ft-productdata"),
                fid: $(this).attr("data-funnel_product_id"),
                ffid: $(this).attr("data-ft-funneldata"),
            };
            var data = JSON.stringify($dataObject);

            if (curObj.hasClass("gjs-btneffect")) return false;
            curObj.addClass("gjs-btneffect");

            callHTTP(BASE_URL + "/no-thanks", data, function (res) {
                if (res.readyState === 4) {
                    var response = JSON.parse(res.responseText);
                    var url = response.no_thanks_url;

                    if (!verifier(url)) window.location.href = url;
                    curObj.removeClass("gjs-btneffect");
                }
            });
            return !1;
        }),
        $(document).on("click", "a[href*='#submit']", async function () {
            var formId = $(this).attr("data-formid");
            var clset_id = $(this).closest("form").attr("id");
            if (formId !== clset_id) formId = clset_id;

            $dataObject = {};
            if (!verifier(formId)) {
                $formData = $("#" + formId).serializeArray();

                $formData.map(function (val) {
                    var key = val.name;
                    $dataObject[key] = val.value;
                });
                $dataObject["form_id"] = formId;
            } else $dataObject = getAllFormsData($dataObject);

            if (ai != null && pi != null)
                ($dataObject["ai"] = ai), ($dataObject["pi"] = pi);

            //Form Default Valiation
            var formEle = $("#" + formId);
            if (!formEle[0].checkValidity()) {
                var errList = {
                    empty: ["Please fill in all the required fields"],
                };
                formErrMsgShowUp(formId, errList);
                formEle[0].reportValidity();
                return false;
            }

            //Form Manual Valiation
            var res = formvalidation(formId, $dataObject);
            if (res.fail == false) return false;
            else $dataObject = res.formData;

            var curObj = $(this);
            if ($(curObj).hasClass("skeleton-loader")) return false;
            curObj.addClass("skeleton-loader");
            // var btnApp = $(this).find(".ffbtntxt");
            // if (!btnLoader(btnApp, curObj)) return false; //Multi Acation prevent

            var goNext = $(this).attr("data-nextGo")
                ? $(this).attr("data-nextGo")
                : ""; //after
            var gotarget = $(this).attr("data-target")
                ? $(this).attr("data-target")
                : "_self"; //after
            var smsg = curObj.attr("data-smsg") ? curObj.attr("data-smsg") : "";

            // if (formId !== "" && typeof formId !== "undefined") {
            //     $formData = $("#" + formId).serializeArray();

            //     $formData.map(function (val) {
            //         var key = val.name;
            //         $dataObject[key] = val.value;
            //     });
            //     $dataObject["form_id"] = formId;
            // } else $dataObject = getAllFormsData($dataObject);

            $dataObject["funnel_id"] = $("meta[name=funnel_id]").attr(
                "content"
            );
            $dataObject["funnel_page_id"] = $("meta[name=funnel_page_id]").attr(
                "content"
            );

            $dataObject["rule_id"] = "0";
            var device = getUA();
            $dataObject["device"] = device;
            // if ($order["coupon"].status) {
            //     $dataObject["coupon_code"] = $order["coupon"].coupon_code;
            // }
            $dataObject = getUTMtracking(
                params,
                $dataObject,
                $dataObject["funnel_page_id"]
            );

            //console.log($dataObject);
            //console.log("test");
            // return false;

            // if (t.status) {
            //     $dataObject["utag_main"] = t["utm"];
            //     Object.keys(t["utm"]).forEach(function (key, value) {
            //         $dataObject[key] = t["utm"][key];
            //     });
            // }

            var data = JSON.stringify($dataObject);
            $(".ft-form-error").remove();
            //AutoResponder form code
            if ($("#" + formId).hasClass("ft-autoresponder")) {
                var type = $(this).attr("data-autoresponder");
                if (typeof type !== "undefined") {
                    var phone = validatePhone($dataObject["phone"]);
                    if (!phone) {
                        curObj
                            .parent()
                            .prepend(
                                `<span class="ft-form-error">Please add country code before the phone number</span>`
                            );
                        curObj.removeClass("gjs-btneffect");
                        curObj.find(".fa-spin").remove();
                        return false;
                    }
                }

                // function ajaxMaskUI(settings) {
                //     function maskPageOn(color) { // color can be ie. 'rgba(176,176,176,0.7)' or 'transparent'
                //         var div = $('#maskPageDiv');
                //         if (div.length === 0) {
                //             $(document.body).append('<div id="maskPageDiv" style="position:fixed;width:100%;height:100%;left:0;top:0;display:none"></div>'); // create it
                //             div = $('#maskPageDiv');
                //         }
                //         if (div.length !== 0) {
                //             div[0].style.zIndex = 2147483647;
                //             div[0].style.backgroundColor=color;
                //             div[0].style.display = 'inline';
                //         }
                //     }
                //     function maskPageOff() {
                //         var div = $('#maskPageDiv');
                //         if (div.length !== 0) {
                //             div[0].style.display = 'none';
                //             div[0].style.zIndex = 'auto';
                //         }
                //     }
                //     function hourglassOn() {
                //         if ($('style:contains("html.hourGlass")').length < 1) $('<style>').text('html.hourGlass, html.hourGlass * { cursor: wait !important; }').appendTo('head');
                //         $('html').addClass('hourGlass');
                //     }
                //     function hourglassOff() {
                //         $('html').removeClass('hourGlass');
                //     }

                //     if (settings.maskUI===true) settings.maskUI='transparent';

                //     if (!!settings.maskUI) {
                //         maskPageOn(settings.maskUI);
                //         hourglassOn();
                //     }

                //     var dfd = new $.Deferred();
                //     $.ajax(settings)
                //         .fail(function(jqXHR, textStatus, errorThrown) {
                //             if (!!settings.maskUI) {
                //                 maskPageOff();
                //                 hourglassOff();
                //             }
                //             dfd.reject(jqXHR, textStatus, errorThrown);
                //         }).done(function(data, textStatus, jqXHR) {
                //             if (!!settings.maskUI) {
                //                 maskPageOff();
                //                 hourglassOff();
                //             }
                //             dfd.resolve(data, textStatus, jqXHR);
                //         });

                //     return dfd.promise();
                // }
                var formAction = $("#" + formId + "_autores form").attr(
                    "action"
                );
                var domain = actionUrlCheck(formAction);
                acDomin = domain.split(".");
                var myVar = await $.ajax({
                    type: "POST",
                    url: BASE_URL + "/subscribe",
                    data: data,
                    // dataType: "json",
                    contentType: "application/json",
                    success: function (res) {
                        // if (this.response) {
                        // var data = JSON.parse(res.body);
                        var res = res.body;
                        if (res.status == true) {
                            var ardata = res.ardata;
                            var hidenForm = $("#" + formId + "_autores");
                            Object.keys(ardata).forEach(function (key, value) {
                                if (key == "SMS__COUNTRY_CODE") {
                                    var ft_countrycode = ardata[key];
                                    if (ft_countrycode != "") {
                                        if (ft_countrycode.indexOf("+") == -1) {
                                            ft_countrycode =
                                                "+" + ft_countrycode;
                                        }
                                    }
                                    hidenForm
                                        .find('[name="' + key + '"]')
                                        .val(ft_countrycode);
                                } else if (key == "SMS") {
                                    var phone = ardata[key];
                                    var ft_countrycode =
                                        ardata["SMS__COUNTRY_CODE"];
                                    if (ft_countrycode != "") {
                                        if (ft_countrycode.indexOf("+") == -1) {
                                            ft_countrycode =
                                                "+" + ft_countrycode;
                                        }
                                    }
                                    var ft_phonenumber = phone.replace(
                                        ft_countrycode,
                                        ""
                                    );

                                    hidenForm
                                        .find('[name="' + key + '"]')
                                        .val(ft_phonenumber);
                                } else {
                                    hidenForm
                                        .find('[name="' + key + '"]')
                                        .val(ardata[key]);
                                }
                            });
                            //return;
                            // var isSubmit = hidenForm.find(
                            //     'input[name="submit"],input[type="submit"]'
                            // );
                            var isSubmit = hidenForm.find(
                                'input[name="submit"],input[type="submit"],[id=submit]'
                            );

                            // isSubmit.each(function (c) {
                            //     $(this).remove();
                            // });

                            if (
                                device == "iPad" ||
                                device == "iPod" ||
                                device == "iPhone" ||
                                device == "macOS" ||
                                device == "Unknown"
                            ) {
                                var isForm = hidenForm.find(
                                    '[target="_blank"],[target=_blank],[target="_zcSignup"]'
                                );
                                isForm.each(function (c) {
                                    $(this).removeAttr("target");
                                });
                            }
                            formSucssMsgShowUp(formId, curObj, smsg);
                            if (!acDomin.includes("icontact")) {
                                isSubmit.each(function (c) {
                                    $(this).remove();
                                });
                            }
                            // if (isSubmit.length == 1) {
                            //     isSubmit.click();
                            // } else {
                            //     hidenForm.find("form").submit();
                            // }
                        } else if (res.status == false) {
                            formErrMsgShowUp(formId, res.message);
                        }
                        // }
                    },
                    error: function (res) {
                        console.log(res);
                    },
                });
                if (acDomin.includes("icontact")) {
                    var hidenForm = $("#" + formId + "_autores");
                    var isSubmit = hidenForm.find(
                        'input[name="submit"],input[type="submit"],[id=submit]'
                    );
                    isSubmit.click();
                } else {
                    $("#" + formId + "_autores")
                        .find("form")
                        .trigger("submit");
                }
                return true;
                // var xhr = new XMLHttpRequest();
                // xhr.addEventListener("readystatechange", function () {
                //     if (this.readyState === 4) {
                //         // curObj.removeClass("gjs-btneffect");
                //         // curObj.find(".fa-spin").remove();
                //         //console.log(this.response);
                //         if (this.response) {
                //             var data = JSON.parse(this.response);
                //             var res = data.body;

                //             if (res.status == true) {
                //                 formSucssMsgShowUp(formId, curObj, smsg);

                //                 var ardata = res.ardata;
                //                 var hidenForm = $("#" + formId + "_autores");

                //                 Object.keys(ardata).forEach(function (
                //                     key,
                //                     value
                //                 ) {
                //                     hidenForm
                //                         .find('[name="' + key + '"]')
                //                         .val(ardata[key]);
                //                 });
                //                 // var isSubmit = hidenForm.find(
                //                 //     'input[name="submit"],input[type="submit"]'
                //                 // );
                //                 var isSubmit = hidenForm.find(
                //                     'input[name="submit"],input[type="submit"],[id=submit]'
                //                 );

                //                 isSubmit.each(function (c) {
                //                     $(this).remove();
                //                 });
                //                 hidenForm.find("form").submit();

                //                 // if (isSubmit.length == 1) {
                //                 //     isSubmit.click();
                //                 // } else {
                //                 //     hidenForm.find("form").submit();
                //                 // }
                //             } else if (res.status == false) {
                //                 formErrMsgShowUp(formId, res.message);
                //             }
                //         }
                //     }
                // });

                // xhr.open("POST", BASE_URL + "/subscribe");
                // xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                // xhr.setRequestHeader("authorizationToken", path.host);
                // xhr.setRequestHeader("Content-Type", "application/json");
                // xhr.send(data);
            }
            //FlxiFunnel Form code
            else {
                // var smsg = curObj.attr("data-smsg")
                //     ? curObj.attr("data-smsg")
                //     : "";

                // callHTTP(BASE_URL + "/subscribe", data, function(res) {
                //     if (res.readyState === 4) {
                //         if (res.response) {
                //             var data = JSON.parse(res.response);
                //             var res = data.body;

                //             if (res.status == true) {
                //                 // Success
                //                 formSucssMsgShowUp(formId, curObj, smsg);
                //                 if (goNext !== "")
                //                     window.open(
                //                         goNext,
                //                         gotarget,
                //                         "noopener noreferrer"
                //                     );
                //                 // window.open(goNext, gotarget);
                //             } else if (res.status == false) {
                //                 //Failure
                //                 formErrMsgShowUp(formId, curObj, res.message);
                //             }
                //         }
                //     }
                // });
                var myVar = await $.ajax({
                    type: "POST",
                    url: BASE_URL + "/subscribe",
                    data: data,
                    // dataType: "json",
                    contentType: "application/json",
                    success: function (res) {
                        formSucssMsgShowUp(formId, curObj, smsg);
                    },
                    error: function (res) {
                        formErrMsgShowUp(formId, curObj, res.message);
                    },
                });
                if (goNext !== "") {
                    if (gotarget == "_self") {
                        window.open(goNext, gotarget);
                    } else {
                        if (
                            device == "iPad" ||
                            device == "iPod" ||
                            device == "iPhone" ||
                            device == "macOS" ||
                            device == "Unknown"
                        ) {
                            //  window.open(goNext);
                            window.location.href = goNext;
                        } else {
                            window.open(goNext, "_blank");
                        }

                        // alert(1);
                        // var windowReference = window.open();
                        // myService.getUrl().then(function (goNext) {
                        //     windowReference.location = goNext;
                        // });
                    }
                }
            } //else end
            return false;
        }),
        // ***********************************
        // **************Visiter begin******
        // ***********************************
        (getVisitorData = function () {
            var funnel = $("a[href*='#funnel']");
            var product = $("a[href*='#product']");
            var form = $(".flexi-form").not(".flexi-orderform");
            var orderform = $(".flexi-orderform");
            var viList = [];

            //product data
            if (
                typeof $order !== "undefined" &&
                typeof $order["product"].p_id != "undefined"
            ) {
                var item = {};
                item["type"] = "product";
                item["fromcheckout"] = "checkout";
                item["product_id"] = $order["product"].p_id;
                item["currency"] = $order["product"].currency;
                viList.push(item);
            }

            //product list
            product.each(function (index, obj) {
                var item = {};
                var p_id = $(obj).attr("data-ft-productdata");
                if (!verifier(p_id)) {
                    item["product_id"] = p_id;
                    item["type"] = "product";
                    viList.push(item);
                }
            });
            //Funnel list
            funnel.each(function (index, obj) {
                var item = {};
                var p_id = $(obj).attr("data-ft-productdata");
                if (!verifier(p_id)) {
                    item["product_id"] = p_id;
                    item["type"] = "funnel";

                    var f_id = $(obj).attr("data-ft-funnelData");
                    item["funnel_id"] = f_id;
                    item["funnel_product_id"] = $(obj).attr(
                        "data-funnel_product_id"
                    );
                    viList.push(item);
                }
            });
            //From List
            form.each(function (index, obj) {
                var item = {};
                item["form_id"] = $(obj).attr("id");
                item["type"] = "form";
                viList.push(item);
            });

            //Orderform
            orderform.each(function (index, obj) {
                var item = {};
                item["form_id"] = $(obj).attr("id");
                item["type"] = "orderform";
                viList.push(item);
            });
            return viList;
        });
    // ***********************************
    // **************Visiter end******
    // ***********************************

    // ************************************
    // ************** Affiliate begin******
    // ************************************

    affiliateRequest = function (anyCheckoutExist) {
        // var anyCheckoutExist = $(".flexi-orderform").length > 0 ? true : false;
        var anyProdExist =
            $("a[href*='#product'],a[href*='#funnel']").length > 0
                ? true
                : false;
        var p_visitor = getVisitorData();
        var valCheckout = "fromcheckout";
        var anyCheckoutExist =
            p_visitor.filter(function (o) {
                return o.hasOwnProperty(valCheckout);
            }).length > 0;

        var hostCookie = getCookie(path.host);
        var prodFound = p_visitor.filter((pro) => pro.product_id === pi);

        //NONE CHECKOUT PAGE
        if (
            (ai !== null || hostCookie != "") &&
            anyProdExist === true &&
            anyCheckoutExist !== true
        ) {
            var todaysDate = new Date().toISOString().split("T")[0];
            const chainedPro = prodFound
                .slice(0, prodFound.length)
                .map((item) => item.product_id);

            var filteredChainedPro = chainedPro.filter(function (item, pos) {
                return chainedPro.indexOf(item) == pos;
            });

            var temp = [];
            temp.push({
                key: "chained_pro",
                value: filteredChainedPro,
            });
            if (ai !== null) {
                temp.push({
                    key: path.host,
                    value: ai,
                });
            }
            setCookie(temp);

            var af_id = ai !== null ? ai : getCookie(path.host);
            var p_id = pi != null ? pi : p_visitor[0].product_id;

            var utmId = p_id;
            var uniqFunnelVs = 0;

            if (typeof p_visitor[0].funnel_id != "undefined") {
                var pFunnelId = p_visitor[0].funnel_id;
                var uniqueFunnelVs = getCookie("funnel_pro" + pFunnelId);
                if (uniqueFunnelVs == todaysDate) uniqFunnelVs = 1;
                setCookie([
                    {
                        key: "funnel_pro" + pFunnelId,
                        value: todaysDate,
                    },
                ]);
            }
            if (ti != "") {
                setCookie([
                    {
                        key: "ti" + p_id,
                        value: ti,
                    },
                ]);
            }

            var cVari = "p" + p_id;
            var loadCountVar = "load_flx_affi_" + af_id + "_" + p_id;
            var loadPageTimes = getCookie(loadCountVar);
            if (loadPageTimes !== null) {
                // loadCount = parseInt(loadPageTimes) + 1;
                // console.log(loadCount);
                loadPageTimes++;
                setCookie([
                    {
                        key: loadCountVar,
                        value: loadPageTimes,
                    },
                ]);
                var loadCount = loadPageTimes;
            }

            var uniqueVs = getCookie("un_vs_" + af_id + "_" + p_id);
            var uniqueVendor = getCookie("un_vd_" + p_id);

            var uniqVs = 0;
            if (uniqueVendor == "" && uniqFunnelVs == 0) {
                uniqVs = 1;
                setCookie([
                    {
                        key: "un_vs_" + af_id + "_" + p_id,
                        value: generateUniqueId(),
                    },
                    {
                        key: "un_vd_" + p_id,
                        value: generateUniqueId(),
                    },
                ]);
            }

            var firstpurchase = "firstpurchase_" + af_id + "_" + p_id;
            if (getCookie(firstpurchase) != "")
                var insertedDynaVal = getCookie(firstpurchase);
            else var insertedDynaVal = getCookie("ai_" + af_id + "_" + p_id);

            setCookie([
                {
                    key: cVari,
                    value: af_id,
                },
            ]);

            var affiliateData = {
                affiliate_id: af_id,
                product_id: p_id,
                tracking_code: ti,
                fid: FUNNEL_ID,
                ffid: FUNNEL_PAGE_ID,
                load_count: loadCount,
                vistors_count: uniqVs,
                db_affiliate: insertedDynaVal,
                query_string: path.pathname,
                path: path.pathname,
                p_visitor: p_visitor,
                type: "sales",
            };

            var lus = getCookie("lus_" + FUNNEL_PAGE_ID);

            if (lus != "" && lus != params.get("utm_source")) {
                affiliateData.load_count = 1;
                affiliateData.db_affiliate = "";
            }

            setUTMtracking(params, FUNNEL_PAGE_ID);
            affiliateData = getUTMtracking(
                params,
                affiliateData,
                FUNNEL_PAGE_ID
            );

            if (anyProdExist) affiliateData.affiliate = true;
            var data = JSON.stringify(affiliateData);

            callHTTP(BASE_URL + "/stats", data, function (res) {
                if (res.readyState === 4) {
                    var affiStatsRes = JSON.parse(res.responseText);

                    var affiInsertId =
                        affiStatsRes.SendMessageResponse.SendMessageResult
                            .MessageId;

                    if (insertedDynaVal == "") {
                        setCookie([
                            {
                                key: "affi_val",
                                value: affiInsertId,
                            },
                            {
                                key: "ai_" + af_id + "_" + p_id,
                                value: affiInsertId,
                            },
                        ]);
                    }
                }
            });
        }
        //NORMAL PAGE VISITOR START & NOT FORM PAGE
        else {
            let filter = p_visitor.filter(
                (d) => d.type == "product" || d.type == "funnel"
            );

            var pageLoad = "page_" + FUNNEL_PAGE_ID;
            //IF PRODUCT
            if (anyProdExist) {
                var fProdId = p_visitor[0].product_id;

                var insSingleProduct = getCookie("s_ai" + fProdId);
                var insSinglePro = getCookie(pageLoad);

                var uniqueVs = getCookie("s_un_vs" + fProdId);
                if (uniqueVs == "") {
                    setCookie([
                        {
                            key: "s_un_vs" + fProdId,
                            value: 1,
                        },
                    ]);
                }

                var load_flx = "load_flx_product" + "_" + FUNNEL_PAGE_ID;
                var loadPageTimes = getCookie(load_flx);
                if (loadPageTimes !== null) {
                    // loadCountS = parseInt(loadPageTimes) + 1;
                    // setCookie([
                    //     {
                    //         key: load_flx,
                    //         value: loadCountS
                    //     }
                    // ]);

                    loadPageTimes++;
                    setCookie([
                        {
                            key: load_flx,
                            value: loadPageTimes,
                        },
                    ]);
                    var loadCountS = loadPageTimes;
                } else loadCountS = 1;

                var currency = p_visitor[0].currency;
                if (
                    getCookie("affi_val") != "" &&
                    getCookie("s_ai" + filter[0].product_id) != ""
                )
                    var pageType = "checkout";
                else var pageType = "sales";
            }
            //NOT PRODUCT
            else {
                var pageType = "normal";
                var insSinglePro = getCookie(pageLoad);
                var uniqueVs = getCookie("f_un_vs" + FUNNEL_PAGE_ID);
                if (uniqueVs == "") {
                    setCookie([
                        {
                            key: "f_un_vs" + FUNNEL_PAGE_ID,
                            value: 1,
                        },
                    ]);
                }

                var load_flx = "load_flx_page" + "_" + FUNNEL_PAGE_ID;

                var loadPageTimes = getCookie(load_flx);
                if (!verifier(loadPageTimes)) {
                    // loadCountS = parseInt(loadPageTimes) + 1;
                    // setCookie([
                    //     {
                    //         key: load_flx,
                    //         value: loadCountS
                    //     }
                    // ]);
                    loadPageTimes++;
                    setCookie([
                        {
                            key: load_flx,
                            value: loadPageTimes,
                        },
                    ]);
                    var loadCountS = loadPageTimes;
                } else loadCountS = 1;
            }

            var pageData = {
                fid: FUNNEL_ID,
                ffid: FUNNEL_PAGE_ID,
                load_count: loadCountS,
                vistors_count: uniqueVs ? 0 : 1, //Unique visitor
                query_string: path.pathname,
                path: path.pathname,
                db_affiliate: insSinglePro,
                p_visitor: p_visitor,
                type: pageType,
                currency: currency,
            };

            setUTMtracking(params, utmId);
            pageData = getUTMtracking(params, pageData, utmId);

            pageData.product_id = fProdId ? fProdId : "";
            var lp_value = getCookie("lastpaid");

            if (lp_value != "" && p_visitor.length > 0) {
                var lastpaid = lp_value.split("_");
                pageData.product_id = lastpaid[1];
                pageData.affiliate_id = lastpaid[0];

                pageData.tracking_code = getCookie("ti" + lastpaid[1]);
                pageData.affiliate = true;
                pageData.load_count = 0;
                pageData.db_affiliate = "";
            }

            var firstPurchase_noaffi = getCookie(
                "firstpurchase_noaffi_" + pageData.product_id
            );

            //IF ORDER FORM
            if (anyCheckoutExist) {
                pageData.product_id = filter[0].product_id;

                var firstPurchase = getCookie(
                    "firstpurchase_" +
                        pageData.affiliate_id +
                        "_" +
                        pageData.product_id
                );

                var lastPaidSet = getCookie("last_paid_set");
                var affi_val = getCookie("affi_val");

                if (affi_val != "" && firstPurchase == "")
                    pageData.type = "checkout";
                else if (firstPurchase != "") {
                    pageData.type = "sales";
                    pageData.db_affiliate = lastPaidSet == "" ? "" : affi_val;
                } else if (firstPurchase_noaffi != "") {
                    pageData.type = "sales";

                    pageData.db_affiliate =
                        lastPaidSet == ""
                            ? ""
                            : getCookie("noaffi_" + pageData.product_id);
                    pageData.load_count = 0;
                } else if (getCookie("s_ai" + filter[0].product_id) != "") {
                    pageData.type = "checkout";
                } else if (
                    getCookie("s_ai" + filter[0].product_id) == "" &&
                    filter[0].product_id != ""
                ) {
                    pageData.type = "checkout";
                } else pageData.type = "sales";
            }

            var data = JSON.stringify(pageData);
            callHTTP(BASE_URL + "/stats", data, function (res) {
                if (res.readyState === 4) {
                    var pageStatsRes = JSON.parse(res.responseText);

                    var pInsertId =
                        pageStatsRes.SendMessageResponse.SendMessageResult
                            .MessageId;

                    var lastPaidSet = getCookie("last_paid_set");

                    //Affiliates Back button functionlity start here
                    if (
                        lp_value != "" &&
                        anyCheckoutExist === true &&
                        lastPaidSet == ""
                    ) {
                        setCookie([
                            {
                                key: "last_paid_set",
                                value: pInsertId,
                            },
                            {
                                key: "affi_val",
                                value: pInsertId,
                            },
                            {
                                key:
                                    "ai_" +
                                    pageData.affiliate_id +
                                    "_" +
                                    pageData.product_id,
                                value: pInsertId,
                            },
                        ]);
                    }
                    //Non Affiliates Back button
                    if (
                        firstPurchase_noaffi != "" &&
                        anyCheckoutExist === true &&
                        lastPaidSet == ""
                    ) {
                        var temp = [
                            {
                                key: "last_paid_set",
                                value: pInsertId,
                            },
                            {
                                key: "s_ai" + fProdId,
                                value: pInsertId,
                            },
                            {
                                key: "noaffi_" + fProdId,
                                value: pInsertId,
                            },
                        ];
                        setCookie(temp);
                    }
                    //Non Affiliates Back button

                    if (!verifier(insSingleProduct) && p_visitor.length > 0) {
                        setCookie([
                            {
                                key: "s_ai" + fProdId,
                                value: pInsertId,
                            },
                            {
                                key: pageLoad,
                                value: pInsertId,
                            },
                            {
                                key: "noaffi_" + fProdId,
                                value: pInsertId,
                            },
                        ]);
                    } else {
                        setCookie([
                            {
                                key: pageLoad,
                                value: pInsertId,
                            },
                        ]);
                    }
                }
            });
        } //NORMAL PAGE VISITOR END
    };
    if ($(".flexi-orderform").length == 0) affiliateRequest();

    // **********************************************
    // ************** Affiliate close*****************
    // **********************************************

    // **********************************************
    // **************Timer Initialize begin**********
    // **********************************************

    pad = function (num, size) {
        if (num > 0) {
            var s = num + "";
            if (s.length < size) s = "0" + s;
            return s;
        } else return "00";
    };
    ftTimerInitalize = function (distance, timerObj) {
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        //  var timer = $('body').find('.countdown');
        timerObj.find(".tdays").html(pad(days, 2));
        timerObj.find(".thours").html(pad(hours, 2));
        timerObj.find(".tminutes").html(pad(minutes, 2));
        timerObj.find(".tseconds").html(pad(seconds, 2));
    };
    ftEveryGreen = function (timerObj) {
        var days = parseInt(timerObj.attr("countdown-days"));
        var hours = parseInt(timerObj.attr("countdown-hours"));
        var minutes = parseInt(timerObj.attr("countdown-minutes"));
        var seconds = parseInt(timerObj.attr("countdown-seconds"));

        var e_type = timerObj.attr("expire-type")
            ? timerObj.attr("expire-type")
            : "";
        var e_days = 0;

        if (e_type == "expirecookie") {
            e_days = timerObj.attr("expire-days")
                ? parseInt(timerObj.attr("expire-days"))
                : 30;
            var e_key = "timerExpire_" + FUNNEL_PAGE_ID + "_" + id;
            var etemp = new Date();
            etemp.setHours(etemp.getHours() + e_days * 24);
            setCookie([
                {
                    key: e_key,
                    value: etemp,
                },
            ]);
        }

        var deadline = new Date();

        deadline.setHours(deadline.getHours() + days * 24);
        deadline.setHours(deadline.getHours() + hours);
        deadline.setMinutes(deadline.getMinutes() + minutes);
        deadline.setSeconds(deadline.getSeconds() + seconds);

        var id = timerObj.attr("id");
        document.cookie =
            "ftGreenEnd_" +
            FUNNEL_PAGE_ID +
            "_" +
            id +
            "=" +
            deadline +
            "; expires=Fri, 31 Dec 9999 23:59:59 GMT";

        var initTime =
            days * 24 + hours * 60 + minutes * 1000 + seconds + e_days;
        document.cookie =
            "ftinitTime_" +
            FUNNEL_PAGE_ID +
            "_" +
            id +
            "=" +
            initTime +
            "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
        return deadline;
    };
    ftTimerEnded = function (timerObj) {
        var eaction = timerObj.attr("countdown-eaction");
        //console.log(eaction);
        if (eaction == 2) {
            timerObj.fadeOut();
            // timerObj.addClass("animate__animated animate__bounceOut");
            // x.getElementsByClassName("countdown-inner")[0].style.display ="none";
        } else if (eaction == 3) {
            var rUrl = timerObj.attr("countdown-rurl");
            window.open(rUrl, "_self");
        } else if (eaction == 5) {
            timerObj.find(".countdown-inner").hide(0, function () {
                timerObj
                    .find(".timer-after-txt")
                    .addClass("animate__animated animate__bounceIn")
                    .show();
            });
        } else if (eaction == 6) {
            var hele = timerObj.attr("hide-element");
            $(hele).hide();
            var sele = timerObj.attr("show-element");
            $(sele).show();
        }
    };
    function Interval(time) {
        this.curObj = null;
        this.timer = false;
        this.interval = null;
        var timer = false;
        this.start = function (obj) {
            this.curObj = obj;

            if (!this.isRunning()) {
                var timerObj = $(this.curObj);
                var date = new Date();
                var endtime = timerObj.attr("countdown-endtime")
                    ? timerObj.attr("countdown-endtime")
                    : 0;

                var hh = timerObj.attr("countdown-end_hh");
                var mm = timerObj.attr("countdown-end_mm");
                var t2 = endtime + " " + hh + ":" + mm;
                var offset = timerObj.attr("countdown-offset")
                    ? timerObj.attr("countdown-offset")
                    : date.getTimezoneOffset();
                var type = timerObj.attr("countdown-type");

                var now = getTimerDate(null, offset);
                var curDate = now.getTime();

                var nd2 = t2;
                var nd2 = getTimerDate(t2, offset);
                //var endDate = new Date(nd2).getTime();
                var endDate = nd2;
                var distance = nd2 - now;

                if (type == "basic") {
                    if (distance <= 0) ftTimerEnded(timerObj);
                    else ftTimerInitalize(distance, timerObj);

                    var cur = this;
                    this.timer = setInterval(function () {
                        var now = getTimerDate(null, offset);
                        var distance = endDate - now;

                        if (distance <= 0) {
                            cur.stop();
                            ftTimerEnded(timerObj);
                            return;
                        }
                        ftTimerInitalize(distance, timerObj);
                    }, time);
                } else if (type == "evergreen") {
                    var days = parseInt(timerObj.attr("countdown-days"));
                    var hours = parseInt(timerObj.attr("countdown-hours"));
                    var minutes = parseInt(timerObj.attr("countdown-minutes"));
                    var seconds = parseInt(timerObj.attr("countdown-seconds"));
                    var e_days = parseInt(timerObj.attr("expire-days"));

                    var e_type = timerObj.attr("expire-type")
                        ? timerObj.attr("expire-type")
                        : "";
                    var e_days =
                        timerObj.attr("expire-type") == "expirecookie"
                            ? parseInt(timerObj.attr("expire-days"))
                            : 0;

                    // console.log(e_type);
                    var initTime =
                        days * 24 +
                        hours * 60 +
                        minutes * 1000 +
                        seconds +
                        e_days;

                    var id = timerObj.attr("id");
                    var coisValue = getCookie(
                        "ftGreenEnd_" + FUNNEL_PAGE_ID + "_" + id
                    );

                    var e_key = "timerExpire_" + FUNNEL_PAGE_ID + "_" + id;
                    if (coisValue == "") {
                        deadline = ftEveryGreen(timerObj);
                    } else {
                        var cotInit = getCookie(
                            "ftinitTime_" + FUNNEL_PAGE_ID + "_" + id
                        );

                        if (cotInit != initTime) {
                            deadline = ftEveryGreen(timerObj);
                        } else {
                            var deadline = coisValue;
                        }
                    }
                    var endDate = Date.parse(new Date());
                    var distance = Date.parse(deadline) - endDate;
                    if (distance <= 0) {
                        if (e_type == "expirecookie") {
                            var t = getCookie(
                                "timerExpire_" + FUNNEL_PAGE_ID + "_" + id
                            );
                            var res = Date.parse(t) - Date.parse(deadline);
                            if (res <= 0) deadline = 0;
                            else deadline = ftEveryGreen(timerObj);
                        } else deadline = ftEveryGreen(timerObj);
                    }

                    var cur = this;

                    this.timer = setInterval(function () {
                        var endDate = Date.parse(new Date());
                        var distance = Date.parse(deadline) - endDate;
                        if (distance <= 0) {
                            cur.stop();
                            ftTimerEnded(timerObj);
                        }
                        ftTimerInitalize(distance, timerObj);
                    }, 1000);
                } //Green Timer End
                else if (type == "daily") {
                    var month = now.getUTCMonth() + 1; //months from 1-12
                    var day = now.getUTCDate();
                    var year = now.getUTCFullYear();

                    endtime = year + "/" + month + "/" + day;
                    //t2 = "2022/05/17 23:59:00";
                    var t2 = endtime + " " + hh + ":" + mm;

                    // var nd2 = getTimerDate(t2, offset);
                    var endDate = new Date(t2).getTime();
                    var distance = endDate - now;

                    var cur = this;

                    if (distance <= 0) ftTimerEnded(timerObj);
                    else ftTimerInitalize(distance, timerObj);

                    this.timer = setInterval(function () {
                        var now = getTimerDate(null, offset);
                        var distance = endDate - now;

                        if (distance <= 0) {
                            cur.stop();
                            ftTimerEnded(timerObj);
                        }
                        ftTimerInitalize(distance, timerObj);
                    }, time);
                } // Daily Timer End
            }
        };

        this.stop = function () {
            clearInterval(this.timer);
            timer = false;
        };
        this.isRunning = function () {
            return timer !== false;
        };
    }

    var timer = $("body").find(".countdown");
    timer.each(function (index, item) {
        var i = new Interval(1000);
        i.start(item);
    });
    // **********************************************
    // **************Timer Initialize begin**********
    // **********************************************

    // **********************************************
    // **************Video Floating begin**********
    // **********************************************

    //Sticky action
    $sticky = $(".ft-stickytop");
    setWrapperSticky = function (sObj) {
        sObj.each(function (index, item) {
            var pobj = $(this).parent();

            var temp = 'class="sticky-parent"';

            if ($(this).hasClass("ftdesktop-visible"))
                temp = 'class="sticky-parent ftdesktop-visible"';
            else if ($(this).hasClass("ftmobile-visible"))
                temp = 'class="sticky-parent ftmobile-visible"';

            var ele = `<div ${temp} style="height:${$(
                this
            ).outerHeight()}px;"></div>`;
            if (pobj.hasClass("sticky-parent"))
                pobj.height($(this).outerHeight());
            else $(this).wrap(ele);
        });
    };
    setWrapperSticky($sticky);

    stickySet = function (scroll) {
        $sticky.each(function (index, item) {
            if ($(this).css("display") == "block") {
                $stickyOffset = $(this).parent().offset().top;
                if (scroll >= $stickyOffset)
                    $(this).addClass("ft-stickytop-box");
                else $(this).removeClass("ft-stickytop-box");
            }
        });
        // if (scroll >= $stickyOffset) $sticky.addClass("ft-stickytop-box");
        // else $sticky.removeClass("ft-stickytop-box");
    };

    $fFirst = $(".ft-floating").first();
    floatingSet = function (fFirst) {
        var floaton = fFirst.attr("floaton");
        if (floaton == "floaton") {
            var s_top = $(window).scrollTop();
            var offset = fFirst.offset();
            var top = fFirst.attr("data-offset");

            if (typeof top == "undefined" || top.trim == "") {
                fFirst.attr("data-offset", offset.top);

                var paheight = fFirst.parent().height();
                fFirst.parent().height(paheight);
            }

            var top =
                parseInt(fFirst.attr("data-offset")) + fFirst.height() / 2;
            if (s_top > top) {
                if (!fFirst.hasClass("ftfloat-set")) {
                    var ftposition = fFirst.attr("ftposition");
                    fFirst.wrap(
                        `<div class='ft-floating-block ${ftposition}'></div>`
                    );
                    fFirst.addClass("ftfloat-set");
                    var ftclose = fFirst.attr("ftclose");
                    if (ftclose == "fcloseon") {
                        $(".ft-floating-block").append(
                            '<div class="ftclose" style="position: absolute;top: -17px;right: -17px;cursor:pointer;z-index: 3;"><img src="https://assets.flexifunnels.com/images/exit.png"/></div>'
                        );
                    }
                }
            } else {
                fFirst.removeClass("ftfloat-set");
                if (fFirst.parent().hasClass("ft-floating-block"))
                    fFirst.unwrap();
                $(".ftclose").remove();
            }
        }
    };
    if ($fFirst.length !== 0) floatingSet($fFirst);
    $(document).on("click", ".ftclose>img", function () {
        $(this).parent().remove();
        var fFirst = $(".ft-floating").first();
        fFirst.attr("floaton", "off");
        fFirst.removeClass("ftfloat-set");
        if (fFirst.parent().hasClass("ft-floating-block")) fFirst.unwrap();
    });

    $(window)
        .scroll(function () {
            var s_top = $(window).scrollTop();
            if ($sticky.length !== 0) stickySet(s_top); //Sticky Calling
            if ($fFirst.length !== 0) floatingSet($fFirst); //floating Calling
        })
        .scroll();
    $(window).resize(function () {
        if ($sticky.length !== 0) setWrapperSticky($sticky); //Sticky Calling
    });
    // **********************************************
    // **************Video Floating begin**********
    // **********************************************

    // **********************************************
    // *************Custom Code begin*************
    // **********************************************
    var custom = $("body").find(".ft-custom-block");
    custom.each(function (index, item) {
        var code = $(this).attr("ft-customcode");
        if (code !== "" && typeof code != "undefined") {
            $(this).children().remove();
            // console.log(code);
            $(this).append(code);
            $(this).removeAttr("ft-customcode");
        }
    });
    // **********************************************
    // *************Custom Code close*************
    // **********************************************

    // **********************************************
    // ************bg Video*************
    // **********************************************
    onPlayerReady = function (event) {
        event.target.playVideo();
    };
    onYouTubeLazy = function (videoId, ref) {
        player = new YT.Player(ref, {
            videoId: videoId,
            playerVars: {
                autoplay: 1,
            },
            events: {
                onReady: onPlayerReady,
            },
        });
    };

    loadPlayer = function (videoId, ref, type) {
        if (typeof YT == "undefined" || typeof YT.Player == "undefined") {
            var tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            var firstScriptTag = document.getElementsByTagName("script")[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubePlayerAPIReady = function () {
                if (type == 1) onYouTubeLazy(videoId, ref);
                else onYouTubePlayer(videoId);
            };
        } else {
            if (type == 1) onYouTubeLazy(videoId, ref);
            else onYouTubePlayer(videoId);
        }
    };
    var player;
    function onYouTubePlayer(videoId) {
        player = new YT.Player("video-placeholder", {
            videoId: videoId,
            playerVars: {
                mute: 1,
                loop: 1,
                autoplay: 1,
                controls: 0,
                showinfo: 0,
                rel: 0,
                showsearch: 0,
                iv_load_policy: 3,
            },
            events: {
                onStateChange: onPlayerStateChange,
            },
        });
    }

    function onPlayerStateChange(event) {
        if (event.data == YT.PlayerState.ENDED) {
            player.seekTo(0);
            player.playVideo();
        }
    }
    var bgvideo = $(".ftvideo-block");
    if (bgvideo.length != 0) {
        if (screen.width > 768) {
            $(".ftvideo-img").hide();
            var mode = bgvideo.attr("data-mode");
            if (mode == "on") loadPlayer(bgvideo.attr("data-videoid"));
        } else $(".ftvideo-img").removeClass("ff-none");
    }
    // **********************************************
    // ************bg Video*************
    // **********************************************

    // **********************************************
    // ************Country code Phone field *********
    // **********************************************
    var phpone = $('input[name="phone"]');
    var country = [];
    if (phpone.length !== 0) {
        phpone.each(function (index, item) {
            try {
                var cur = $(this).attr("name") + "_" + index;
                $(this).attr("data-tel", cur); // console.log(cur);
                country[cur] = window.intlTelInput($(this)[0], {
                    utilsScript: "https://assets.flexifunnels.com/js/utils.js",
                });
                $(item).on("blur", function (e) {
                    var tel = $(this).attr("data-tel");
                    var errorMap = [
                        "Invalid phone number",
                        "Invalid country code",
                        "Phone number too short",
                        "Phone number too long",
                        "Invalid phone number",
                    ];
                    if (country[tel].isValidNumber()) {
                        $(this).attr("data-tel-no", country[tel].getNumber());
                        $(this).attr(
                            "data-tel-countrycode",
                            country[tel].getSelectedCountryData().dialCode
                        );
                        $(this).attr("data-tel-mode", true);
                    } else {
                        var errorCode = country[tel].getValidationError();
                        $(this).attr("data-tel-err", errorMap[errorCode]);
                        $(this).attr("data-tel-mode", false);
                    }
                });
                let code = $(this).attr("country-code")
                    ? $(this).attr("country-code")
                    : "in";
                country[cur].setCountry(code);
            } catch (err) {
                console.log(err);
            }
        });
    }

    var c_list = $('select[name="country"]');
    if (c_list.length != 0) {
        callHTTP(
            "https://plugin.flexifunnels.com/general/countries.json",
            "",
            function (res) {
                if (res.readyState === 4) {
                    c_list.each(function (index, item) {
                        let list = `<option value="">Select a country</option>`;
                        JSON.parse(res.responseText).forEach(function (
                            item,
                            index
                        ) {
                            list += `<option value="${item.code}">${item.name}</option>`;
                        });
                        $(this).append(list);
                    });
                }
            },
            "get"
        );
    }

    // **********************************************
    // ************Country code Phone field *********
    // **********************************************
});
