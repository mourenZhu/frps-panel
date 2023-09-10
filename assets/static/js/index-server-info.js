var loadServerInfo = (function ($) {
    var size = filesize.partial({base: 2, standard: "jedec"});
    var i18n = {};

    /**
     * get server info
     * @param lang {{}} language json
     * @param title page title
     */
    function loadServerInfo(lang, title) {
        i18n = lang;
        $("#title").text(title);
        $('#content').empty();
        var loading = layui.layer.load();

        $.getJSON('/proxy/api/serverinfo').done(function (result) {
            if (result.success) {
                var data = JSON.parse(result.data);
                data.proxy_counts = 0;
                http_port = data.vhost_http_port;
                https_port = data.vhost_https_port;
                for (var proxy in data.proxy_type_count) {
                    data.proxy_counts = data.proxy_counts + data.proxy_type_count[proxy];
                }
                renderServerInfo(data);
            } else {
                layui.layer.msg(result.message);
            }
        }).always(function () {
            layui.layer.close(loading);
        });
    }

    /**
     * render server info page
     * @param data server info data
     */
    function renderServerInfo(data) {
        var html = layui.laytpl($('#serverInfoTemplate').html()).render(data);
        $('#content').html(html);

        renderTrafficChart(data);
        renderCountChart(data);
    }

    /**
     * render traffic chart with echarts
     * @param data traffic data
     */
    function renderTrafficChart(data) {
        var chartLegend = ['total_traffic_in', 'total_traffic_out'];
        var chartData = [
            {value: data.total_traffic_in, name: 'Traffic In'},
            {value: data.total_traffic_out, name: 'Traffic Out'}
        ];
        var chartDom = document.getElementById('trafficPieChart');
        var chart = echarts.init(chartDom);
        var option = {
            title: {
                text: 'Network Traffic',
                subtext: 'today',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (v) {
                    return size(v.value) + ' (' + v.percent + '%)';
                },
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: chartLegend,
            },
            series: [
                {
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: chartData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && chart.setOption(option);
    }

    /**
     * render proxy count chat with echarts
     * @param data proxy count data
     */
    function renderCountChart(data) {
        var proxies = data.proxy_type_count;
        var chartLegend = [];
        var chartData = [];

        for (var type in proxies) {
            var temp = {
                name: type.toUpperCase(),
                value: proxies[type]
            };
            chartLegend.push(type);
            chartData.push(temp);
        }
        var chartDom = document.getElementById('countPieChart');
        var chart = echarts.init(chartDom);
        var option = {
            title: {
                text: 'Proxies',
                subtext: 'now',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: function (v) {
                    return v.value + ' (' + v.percent + '%)';
                }
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: chartLegend,
            },
            series: [
                {
                    type: 'pie',
                    radius: '55%',
                    center: ['50%', '60%'],
                    data: chartData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };

        option && chart.setOption(option);
    }

    return loadServerInfo;
})(layui.$);