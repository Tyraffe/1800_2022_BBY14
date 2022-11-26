var currentUser;
var incomeSum = 0;
var userCurrency;
var currencyPercent;
var moneySymbol;
var xValues = [];
var yValues = [];
var y;
var x;
var barColors = ["red", "green", "blue", "orange", "grey"];

function checkLogin(){
    firebase.auth().onAuthStateChanged(user => {
        // Check if a user is signed in:
        if (user) {
            currentUser = db.collection("users").doc(user.uid);
            username = user.displayName;
            currentUser.get().then(doc => {
                userCurrency = doc.data().userCurrency;
                ref = db.collection("currency").doc(userCurrency);
                ref.get().then(currency => {
                    currencyPercent = currency.data().conversionPercent;
                    moneySymbol = currency.data().moneySymbol;
                    document.getElementById("name-goes-here").innerText = username;
                    getIncomeSum();
                });
            })
        } else {
            window.location.assign("index.html");
        }
    })
}
checkLogin();

function getIncomeSum(){
    currentUser.collection("income").get().then(allIncome => {
        allIncome.forEach(doc => {
            incomeSum = incomeSum + doc.data().income;
            if (incomeSum == NaN) {
                displayIncomeLink();
            } else {
                addExpected();
                addActual();
                addCategories();
            }
        })
    })
}

function addExpected(){
    const expectedExpenses = document.getElementById("expectedExpenses");
    let ySum = 0;
    currentUser.collection("categories").get().then(allCategories => {
        allCategories.forEach(doc => {
            xValues.push(doc.data().name);
            y = doc.data().percentage * incomeSum * currencyPercent;
            ySum += y;
            yValues.push(y.toFixed(2));
        })
        xValues.push("Unspent Income");
        yValues.push(((incomeSum * currencyPercent) - ySum).toFixed(2))
        new Chart(expectedExpenses, {
            type: "pie",
            data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
            },
            options: {
            title: {
                display: true,
                text: "Expected Expenses"
            },
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        return moneySymbol + data.datasets[0].data[tooltipItem.index].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                    }
                }
            }
            }
        });
        xValues = [];
        y = 0;
        yValues = [];
    })
}

// NEEDS TO BE REWORKED
function addActual(){
    const actualExpenses = document.getElementById("actualExpenses");
    let ySum = 0;
    currentUser.collection("categories").get().then(allCategories => {
        allCategories.forEach(doc => {
            xValues.push(doc.data().name);
        })
    });
    currentUser.collection("categories").get().then(allCategories => {
        allCategories.forEach(doc => {
            currentUser.collection("expenses").get().then(allExpenses => {
                allExpenses.forEach(expense => {
                    if (expense.data().paymentCategory == doc.data().name){
                        y = y + expense.data().expense;
                        ySum += y;
                    } 
                })
            })
            yValues.push(y);
            y = 0;
        })
        xValues.push("Unspent Income");
        yValues.push(incomeSum - ySum)
        new Chart(actualExpenses, {
            type: "pie",
            data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
            },
            options: {
            title: {
                display: true,
                text: "Actual Expenses"
            }
            }
        })
        xValues = [];
        y = 0;
        yValues = [];
    })
}

function addCategories(){
    const categoriesGraph = document.getElementById("categoriesGraph");
    currentUser.collection("categories").get().then(allCategories => {
        allCategories.forEach(doc => {
            console.log(doc.data().name)
            xValues.push(doc.data().name);
        })

        console.log(xValues);
        var promise1 = new Promise(function(resolve, reject) {
            y = xValues.map((x) => {
                setTimeout(function(){ resolve(yValues); }, 300);
                let yAdd = 0;
                currentUser.collection("expenses").get().then(allExpenses => {
                    allExpenses.forEach(doc => {   
                        if (doc.data().paymentCategory == x){
                            yAdd = yAdd + doc.data().expense;
                            console.log(yAdd);
                        }
                    })
                    console.log(yValues);
                    yValues.push((yAdd * currencyPercent).toFixed(2));
                })
            });
        });
            
        promise1.then((yValues) => {
            console.log(yValues);
            new Chart(categoriesGraph, {
                type: "bar",
                data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues
                }]
                },
                options: {
                    legend: {display: false},
                    title: {
                      display: true,
                      text: "Expense Categories"
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value, index, values) {
                                    if(parseInt(value) >= 1000){
                                        return moneySymbol + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    } else {
                                        return moneySymbol + value;
                                    }
                                }
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return moneySymbol + tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }
                        }
                    }
                }
            })
            addSources();
        })
    })
}

function addSources(){
    xValues = [];
    y = 0;
    yValues = [];
    const sourcesGraph = document.getElementById("sourcesGraph");
    currentUser.collection("sources").get().then(allSources => {
        allSources.forEach(doc => {
            console.log(doc.data().name)
            xValues.push(doc.data().name);
        })
        console.log(xValues);
        var promise2 = new Promise(function(resolve, reject) {
            y = xValues.map((x) => {
                setTimeout(function(){ resolve(yValues); }, 300);
                let yAdd = 0;
                currentUser.collection("income").get().then(allIncome => {
                    allIncome.forEach(doc => {   
                        if (doc.data().incomeCategory == x){
                            yAdd = yAdd + doc.data().income;
                            console.log(yAdd);
                        }
                    })
                    console.log(yValues);
                    yValues.push((yAdd * currencyPercent).toFixed(2));
                })
            });
        });
            
        promise2.then((yValues) => {
            console.log(yValues);
            new Chart(sourcesGraph, {
                type: "bar",
                data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues
                }]
                },
                options: {
                    legend: {display: false},
                    title: {
                      display: true,
                      text: "Income Sources"
                    },
                    scales: {
                        yAxes: [{
                            ticks: {
                                beginAtZero: true,
                                callback: function(value, index, values) {
                                    if(parseInt(value) >= 1000){
                                        return moneySymbol + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                                    } else {
                                        return moneySymbol + value;
                                    }
                                }
                            }
                        }]
                    },
                    tooltips: {
                        callbacks: {
                            label: function(tooltipItem, data) {
                                return moneySymbol + tooltipItem.yLabel.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                            }
                        }
                    }
                }
            })
        })
    })
}