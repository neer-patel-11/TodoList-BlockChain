
App ={
    contracts: {},
    
    load: async() =>{
        await App.loadWeb3();
        console.log("app loading ..");
        await App.loadAccount();
        await App.loadContract();
        await App.render();
        

    },

    loadWeb3: async () => {
        if (typeof web3 !== 'undefined') {
          App.web3Provider = web3.currentProvider
          web3 = new Web3(web3.currentProvider)
        } else {
          window.alert("Please connect to Metamask.")
        }
        // Modern dapp browsers...
        if (window.ethereum) {
          window.web3 = new Web3(ethereum)
          try {
            // Request account access if needed
            await ethereum.enable()
            // Acccounts now exposed
            web3.eth.sendTransaction({/* ... */})
          } catch (error) {
            // User denied account access...
          }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
          App.web3Provider = web3.currentProvider
          window.web3 = new Web3(web3.currentProvider)
          // Acccounts always exposed
          web3.eth.sendTransaction({/* ... */})
        }
        // Non-dapp browsers...
        else {
          console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
        }
      },

      async loadAccount(){
      
        console.log("we are almo..")
        // App.account = web3.eth.getAccounts();
        // App.account=App.account[0]
        // App.account=web3.eth.getAccounts.then( function (result) { return result[0] });
        web3.eth.defaultAccount=web3.eth.accounts[0]
        App.account=web3.eth.accounts[0]
        console.log(App.account)


      },

      async loadContract(){
        const todoList = await $.getJSON('ToDoList.json')
        // console.log(todoList)
        App.contracts.TodoList = TruffleContract(todoList)
        
        App.contracts.TodoList.setProvider(App.web3Provider)

        App.todoList =await App.contracts.TodoList.deployed()
        // Hydrate the smart contract with values from the blockchain
        // App.todoList =TruffleContract(todoList).deployed()
        

      },

      render: async()=>{

        if(App.loading)
        {
          return;
        }
        App.setLoading(true);


        $('#account').html(App.account)


        await App.renderTask();

        App.setLoading(false);

      },

      renderTask : async()=>{
        const taskCount = await App.todoList.taskCount()
        console.log("taskCount")
        console.log(taskCount)

        const $taskTemplate = $('.taskTemplate')

        for (let i = 1; i <= taskCount; i++) {
          const task =await App.todoList.tasks(i)
          const taskId =task[0].toNumber()
          const taskContent = task[1]
          const taskCompleted = task[2]

          const $newTaskTemplate = $taskTemplate.clone()
          $newTaskTemplate.find('.content').html(taskContent)
          $newTaskTemplate.find('input')
                          .prop('name', taskId)
                          .prop('checked', taskCompleted)
                          .on('click', App.toggleCompleted)
    
          // Put the task in the correct list
          if (taskCompleted) {
            $('#completedTaskList').append($newTaskTemplate)
          } else {
            $('#taskList').append($newTaskTemplate)
          }
    
          // Show the task
          $newTaskTemplate.show()

          
        }

      },

      createTask: async()=>{
        App.setLoading=true;
        const content=$('#newTask').val()
        await App.todoList.createTask(content)
        window.location.reload()
        App.setLoading=false;
      },

      toggleCompleted: async(e)=>{
        App.setLoading=true
        const taskId = e.target.name
        await App.todoList.toggleCompleted(taskId)
        window.location.reload()
        App.setLoading=false;

      },

      setLoading: (boolean) => {
        App.loading = boolean
        const loader = $('#loader')
        const content = $('#content')
        if (boolean) {
          loader.show()
          content.hide()
        } else {
          loader.hide()
          content.show()
        }
      }
      
}

$(()=>{
    $(window).load(()=>{
        App.load()
    })
})