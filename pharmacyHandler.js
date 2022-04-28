/**
 * @author SOSELab@NTOU <albert@ntou.edu.tw>
 */

$(function() {
    initializeAllDataSource();
    $("#update").on("click", function() {
        initializeAllDataSource('update');
    });
});

function initialize() {
    $("#search").attr("disabled", true);
    $("#myInput").val("");
    $("#update").hide();
}

function initializeAllDataSource(action="") {
    let testKitDataUrl = "https://data.nhi.gov.tw/resource/Nhi_Fst/Fstdata.csv";
    initialize();
    getAvailableTestKitDataLists(testKitDataUrl);
    setFilterDataBtn();
    if (action === "") {
        setShowAllDataBtn();
    } else {
        showLoadingBar();
    }
}

function searchTestKit(pharmacyId, lines) {
    pharmacyId = String(pharmacyId).replace(/ /g, "");
    let maskData = [];
    for (let index=1; index<=lines.length; index++) {
        lines[index][0] = String(lines[index][0]).replace(/ /g, "");
        console.log(lines[index][0]);
        console.log(pharmacyId);
        if (lines[index][0].id === pharmacyId) {
            maskData = lines[index];
            console.log(maskData);
            break;
        }
    }

    return maskData;
}

function getAvailableTestKitDataLists(testKitDataUrl) {

    $("#list").html("");
    $.get(testKitDataUrl, function(data, eventMessage) {
        if (eventMessage !== 'success') {
            $("#list").html("擷取資料錯誤！");
        }

        // 醫事機構代碼,醫事機構名稱,醫事機構地址,經度,緯度,醫事機構電話,廠牌項目,快篩試劑截至目前結餘存貨數量,來源資料時間,備註
        var allTextLines = data.split(/\r\n|\n/);
        var headers = allTextLines[0].split(',');
        var lines = [];

        for (var i=1; i<allTextLines.length; i++) {
            var data = allTextLines[i].split(',');
            if (data.length == headers.length) {

                var row = [];
                for (var j=0; j<headers.length; j++) {
                    row.push(headers[j]+":"+data[j]);
                }
                lines.push(row);
            }
        }

        for (let item in lines) {

            let addr = lines[item][2] ? lines[item][2] : "住址無資料";
            let tel = lines[item][5] ? lines[item][5] : "電話無資料";
            let mapURL = lines[item][2] ? "https://www.google.com/maps?q=" + lines[item][1].split(':')[1] + "+" + lines[item][2].split(':')[1] : "https://www.google.com/maps?q=" + lines[item][1].split(':')[1];

            let testKitVendorName = 0;
            let testKitNumber = 0;
            let updatedTime = '無來源資料時間';
            let message = '無備註';

            if (lines[item].length !== 0) {
                testKitVendorName = lines[item][6];
                testKitNumber = lines[item][7];
                updatedTime = lines[item][8];
                message = lines[item][9];
            }

            testKitVendorName = String(testKitVendorName);
            testKitNumber = String(testKitNumber);

            //Add new card body
            let content = [
                "<div class='card-body'>",
                "<h5 class='card-title' ><p>", lines[item][0], "</p>", lines[item][1] + "</h5>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-muted'>", addr, "</h6>",
                "</p>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-muted'>", tel, "</h6>",
                "</p>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-danger mask-info'>", testKitVendorName, "</h6>",
                "</p>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-danger mask-info'>", testKitNumber, "</h6>",
                "</p>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-muted mask-info'>", message, "</h6>",
                "</p>",
                "<p>",
                "<h6 class='card-subtitle mb-2 text-muted mask-info'>", updatedTime, "</h6>",
                "</p>",
                "<a href = '", mapURL, "' target='_blank' class='card-link'>地圖連結</a>",
                "<a href = 'https://www.nhi.gov.tw/QueryN/Query3_Detail.aspx?HospID=", lines[item][0].split(':')[1], "' target='_blank' class='card-link'>中央健保署連結</a>",
                "</div>"
            ].join("");
            $("#list").append(content);
            $("#loading").hide();
            $("#msg").hide();
            $("#search").attr("disabled", false);
        }

        $("#update").show();
    });
}

function setFilterDataBtn() {
    //Filter data based on the user input
    $("#search").on("click", function() {
        let value = $("#myInput").val();
        $("#list div").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1);
        });
    });
}

function setShowAllDataBtn() {
    $("#all").on("click", function() {
        $("#msg").show();
        $("#myInput").val("");
        $("#search").attr("disabled", true);
        $("#list").hide();
        showLoadingBar();
    });
}

function showLoadingBar() {
    $("#loading").show("fast", function() {
        $("#list div").filter(function() {
            $(this).toggle(true);
            $("#loading").hide();
            $("#list").show();
            $("#msg").hide();
            $("#search").attr("disabled", false);
        });
    });
}
