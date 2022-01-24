'use strict';

require('dotenv').config();

const fs = require('fs');
const ChartJSImage = require('chart.js-image');
const data = require('../data/data5');
const blueRoles = ['servant', 'percival', 'merlin'];
const redRoles = ['mordred', 'assassin', 'morgana', 'oberon', 'minion'];
const allRoles = blueRoles.concat(redRoles);
const merlinRoleName = 'merlin';
const nameRoleCountWin = {};
const roleNameCountWin = {};

let textResults;

const sampleFunctionToSearchGameLinksByAnyConditions = () => {
    Object.entries(a).forEach(( el, y ) => {
        let i;
        const e = el[1];

        e?.names?.forEach(( name, index ) => {
            if ( name.includes('Кроша ') ) {
                i = index;
            }
        });
        if ( i !== undefined && e?.roles[i] === 'oberon' ) {
            console.log(el[0]);
        }
    });
};

const getTextResults = async () => {
    try {
        const games = Object.values(data).filter(e => e !== null);
        const totalGames = games.length;
        const totalRedWin = games.filter(e => e.redWin).length;
        const totalRedWinByMissions = games.filter(e => e.redWin && e.byMissions).length;
        const totalRedWinByMerlinShot = games.filter(e => e.redWin && !e.byMissions).length;
        const totalBlueWin = games.filter(e => e.blueWin).length;

        textResults = {
            'Всего игр': totalGames,
            'Побед синих: ': (totalBlueWin / totalGames * 100).toFixed(1) + '%',
            'Побед красных: ': (totalRedWin / totalGames * 100).toFixed(1) + '%',
            'Побед красных по походам: ': (totalRedWinByMerlinShot / totalRedWin * 100).toFixed(1) + '%',
            'Побед красных по выстрелу в Мерлина: ': (totalRedWinByMissions / totalRedWin * 100).toFixed(1) + '%'
        };
        console.log(JSON.stringify(textResults, null, 2));
    } catch ( e ) {
        console.log(e);
    }
};

const getBarCharts = async () => {

};

const getNameRoleCountWin = () => {
    const games = Object.values(data).filter(e => e !== null);

    for ( const game of games ) {
        for ( let i = 0; i < game.names.length; i++ ) {
            const name = game.names[i].trim();
            const role = game.roles[i];
            const hasWin = game.blueWin && blueRoles.includes(role) || !game.blueWin && !blueRoles.includes(role);
            const isLiveMerlin = role === merlinRoleName && hasWin && !game.merlinShot
                ? true
                : undefined;
            const isDeadMerlin = role === merlinRoleName && !hasWin && game.merlinShot
                ? true
                : undefined;

            if ( !nameRoleCountWin[name] ) {
                nameRoleCountWin[name] = {};
            }
            if ( !nameRoleCountWin[name][role] ) {
                nameRoleCountWin[name][role] = {
                    totalCount: 0,
                    wins: 0,
                    loses: 0
                };
                if ( role === merlinRoleName ) {
                    nameRoleCountWin[name][role].liveMerlin = 0;
                    nameRoleCountWin[name][role].deadMerlin = 0;
                }
            }
            nameRoleCountWin[name][role].totalCount++;
            if ( hasWin ) {
                nameRoleCountWin[name][role].wins++;
            } else {
                nameRoleCountWin[name][role].loses++;
            }
            if ( isLiveMerlin ) {
                nameRoleCountWin[name][role].liveMerlin++;
            } else if ( isDeadMerlin ) {
                nameRoleCountWin[name][role].deadMerlin++;
            }
        }
    }
};

const getRoleNameCountWin = () => {
    for ( const roleName of allRoles ) {
        roleNameCountWin[roleName] = {};
        for ( const name of Object.keys(nameRoleCountWin) ) {
            if ( nameRoleCountWin[name].hasOwnProperty(roleName) ) {
                const roleData = nameRoleCountWin[name][roleName];

                if ( roleData.totalCount > 2 ) {
                    const percent = (roleData.wins / roleData.totalCount * 100).toFixed(1);

                    roleNameCountWin[roleName][name] = [];
                    roleNameCountWin[roleName][name][0] = percent;
                    roleNameCountWin[roleName][name][1] = `${percent}% из ${roleData.totalCount} игр`;
                }
            }
        }
    }
};

const run = async () => {
    /*const a = ChartJSImage().chart({
        'type': 'bar',
        'data': {
            'labels': [
                'January',
                'February',
                'March',
                'April',
                'May',
                'June',
                'July'
            ],
            'datasets': [
                {
                    'label': 'My First dataset',
                    'borderColor': 'rgb(255,+99,+132)',
                    'backgroundColor': 'rgba(255,+99,+132,+.5)',
                    'data': [
                        57,
                        90,
                        11,
                        -15,
                        37,
                        -37,
                        -27
                    ]
                },
                {
                    'label': 'My Second dataset',
                    'borderColor': 'rgb(54,+162,+235)',
                    'backgroundColor': 'rgba(54,+162,+235,+.5)',
                    'data': [
                        71,
                        -36,
                        -94,
                        78,
                        98,
                        65,
                        -61
                    ]
                },
                {
                    'label': 'My Third dataset',
                    'borderColor': 'rgb(75,+192,+192)',
                    'backgroundColor': 'rgba(75,+192,+192,+.5)',
                    'data': [
                        48,
                        -64,
                        -61,
                        98,
                        0,
                        -39,
                        -70
                    ]
                },
                {
                    'label': 'My Fourth dataset',
                    'borderColor': 'rgb(255,+205,+86)',
                    'backgroundColor': 'rgba(255,+205,+86,+.5)',
                    'data': [
                        -58,
                        88,
                        29,
                        44,
                        3,
                        78,
                        -9
                    ]
                }
            ]
        },
        'options': {
            'title': {
                'display': true,
                'text': 'Chart.js Line Chart'
            },
            'scales': {
                'xAxes': [
                    {
                        'scaleLabel': {
                            'display': true,
                            'labelString': 'Month'
                        }
                    }
                ],
                'yAxes': [
                    {
                        'stacked': true,
                        'scaleLabel': {
                            'display': true,
                            'labelString': 'Value'
                        }
                    }
                ]
            }
        }
    }) // Line chart
        .backgroundColor('white').width(500) // 500px
        .height(300); // 300px*/
    // for (const roleName of allRoles) {
    // const result = {};
    // for (const role of nameRoleCountWin[roleName]) {
    //
    // }
    // results.push(result);
    // console.log(result);
    // }

    for ( const role of Object.keys(roleNameCountWin) ) {
        // const role = Object.keys(roleNameCountWin)[0];

        const roleNameCountWinSorted = Object
            .entries(roleNameCountWin[role])
            .sort(( a, b ) => b[1][0] - a[1][0])
            .reduce(( _sortedObj, [k, v] ) => ({
                ..._sortedObj,
                [k]: v[1]
            }), {});

        const labels = Object.keys(roleNameCountWinSorted);
        // let datasets = [];
        // for (const name of Object.keys(roleNameCountWin[role])) {
        //     datasets.push({
        //         labels: name,
        //         data: [roleNameCountWin[role][name]]
        //     });
        // }
        const datasets = [
            {
                label: role,
                data: Object.values(roleNameCountWinSorted)
            }
        ];

        // console.log(labels);
        // console.log(datasets[0].data);
        const result = JSON.stringify(roleNameCountWinSorted, null, 4)
            .replace(/\"/g, '\'')
            .replace(/(\n {4})'(.*)\s*'(:)/g, '$1$2$3');

        console.log('\n', (role.charAt(0).toUpperCase() + role.slice(1)), '\n');
        console.log(result);
        /*let b = ChartJSImage().chart({
            type: 'bar',
            data: {
                labels,
                datasets
            },
            options: {
                maintainAspectRatio: true,
                spanGaps: false,
                elements: {
                    line: {
                        tension: 0.000001
                    }
                },
                title: {
                    display: true,
                    text: role
                },
                scales: {
                    xAxes: [
                        {
                            scaleLabel: {
                                display: false,
                                labelString: "Names"
                            }
                        }
                    ],
                    yAxes: [
                        {
                            stacked: true,
                            scaleLabel: {
                                display: true,
                                labelString: "Percent"
                            }
                        }
                    ]
                }
            }
        })
            .backgroundColor('white')
            .width(1900) // 500px
            .height(1080);

        await b.toFile('./roles2/' + role + '.png');*/
        // await b.toFile('./chart9.png');
    }
};

getTextResults();
getNameRoleCountWin();
getRoleNameCountWin();
run();
