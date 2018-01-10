import React from 'react';
import './App.css'
import { Draggable, Droppable } from 'react-drag-and-drop';
import firebase from 'firebase';
import $ from 'jquery'
import modal from 'materialize-css'
import'jquery/dist/jquery.slim'
import 'jquery/dist/jquery.slim'
import 'materialize-css'
 // Initialize Firebase
 var config = {
    apiKey: "AIzaSyCPpJhj3CLZhOdvTiMIKnXEe5qcELALOMU",
    authDomain: "todo-with-drag-and-d.firebaseapp.com",
    databaseURL: "https://todo-with-drag-and-d.firebaseio.com",
    projectId: "todo-with-drag-and-d",
    storageBucket: "",
    messagingSenderId: "638386347679"
  };
  firebase.initializeApp(config);

  
let Database = firebase.database().ref('/');

console.log()

class App extends React.Component {

    constructor() {
        super();
        this.state = {
            todo_list: {
                Todo: [],
                Doing: [],
                Review: [],
                Done: []
            }
        };
        $(document).ready(function(){
            // the "href" attribute of the modal trigger must specify the modal ID that wants to be triggered
            $('.modal').modal();
          });
        
              
        this.add_todo_item = this.add_todo_item.bind(this);
    }


    todoType = [
        "Todo",
        "Doing",
        "Review",
        "Done"
    ]

    database_events(todoType) {
        Database.child(`Todo With Drag and Drop/${todoType}/`).on("child_added",
            (snapshot) => {
                let x;
                if (this.state.todo_list)
                    x = this.state.todo_list;
                x[todoType].push({ key: snapshot.key, value: snapshot.val(), edit: false })
                this.setState({ todo_list: x })
                //  console.log(this.state.todo_list)
            }
        );

        Database.child(`Todo With Drag and Drop/${todoType}/`).on("child_changed",
            (snapshot) => {
                // console.log(this.state.todo_list)
                let x, index;
                if (this.state.todo_list)
                    x = this.state.todo_list;
                for (let i = 0; i < x[todoType].length; i++) {
                    if (x[todoType][i].key === snapshot.key && x[todoType][i].edit === true)
                        index = i;
                }
                // console.log(x[index]);
                x[todoType][index].value = snapshot.val();
                x[todoType][index].edit = false;
                this.setState({ todo_list: x })
                // console.log(this.state.todo_list);
            });

        Database.child(`Todo With Drag and Drop/${todoType}/`).on("child_removed",
            (snapshot) => {
                // console.log(snapshot.key, snapshot.val());
                // console.log(this.state.todo_list)
                let x, index;
                if (this.state.todo_list)
                    x = this.state.todo_list;
                for (let i = 0; i < x[todoType].length; i++) {
                    // console.log(x[i]);
                    // console.log({key: snapshot.key, value: snapshot.val(), edit: false});
                    if (x[todoType][i].key === snapshot.key && x[todoType][i].value === snapshot.val() && x[todoType][i].edit === false)
                        index = i;
                }
                // console.log(index);
                x[todoType].splice(index, 1);
                this.setState({ todo_list: x });
                // console.log(this.state.todo_list)
            });
    }

    componentWillMount() {
        this.database_events(this.todoType[0]);
        this.database_events(this.todoType[1]);
        this.database_events(this.todoType[2]);
        this.database_events(this.todoType[3]);
    }

    add_todo_item(ev) {
        console.log(ev);
        if (this.refs.todo_item.value === "" || this.refs.todo_item.value === " ") {
            alert("Please Input Something")
        }
        else {
            Database.child("Todo With Drag and Drop/Todo/").push(this.refs.todo_item.value);
            this.refs.todo_item.value = ""
        }
        ev.preventDefault();
    }

    edit_todo_item = (todoType, index, ev) => {
        // console.log(index, ev.target);
        // console.log(this.state.todo_list);
        ev.preventDefault();
        let x = this.state.todo_list;
        // console.log(x[this.todo_type(todoType)][index].edit);
        x[todoType][index].edit = true;
        this.setState({ todo_list: x })
        console.log(this.state.todo_list);
    }
    cancel_edit = (todoType, index, ev) => {
        // console.log(index, ev.target);
        // console.log(this.state.todo_list);
        ev.preventDefault();
        let x = this.state.todo_list;
        // console.log(x[this.todo_type(todoType)][index].edit);
        x[todoType][index].edit = false;
        this.setState({ todo_list: x })
        // console.log(this.state.todo_list);
    }

    update_todo_item = (todoType, firebase_key, index, ev) => {
        // console.log(index, ev.target);
        // console.log(this.refs.todo_item.value);
        Database.child(`Todo With Drag and Drop/${todoType}/${firebase_key}`).set(this.refs[`${todoType.toLowerCase()}_edit_item_${index}`].value);
        //console.log(this.state.todo_list);
    }

    delete_todo_item = (todoType, firebase_key, index, ev) => {
        // console.log(firebase_key, index, ev.target);
        // console.log(this.state.todo_list);
        Database.child(`Todo With Drag and Drop/${todoType}/${firebase_key}`).remove();
        // console.log(this.state.todo_list);
    }

    on_drop_function = (todoType, data) => {
        // console.log(data.todo, this.todo_type(todoType));
        // console.log(data)
        let values = data.todo.split("/");
        // console.log(values);
        if (values[0] !== todoType) {
            Database.child(`Todo With Drag and Drop/${todoType}/${values[1]}`).set(values[2]);
            Database.child(`Todo With Drag and Drop/${values[0]}/${values[1]}`).remove();
        }
    }

    todo_list_jsx = (todoType) => {
        return (
            <div className="row">
                <div className="col m12">
                    <Droppable
                        types={['todo']} // <= allowed drop types 
                        onDrop={this.on_drop_function.bind(this, todoType)}>
                        <div> <h2>{todoType}</h2> </div>
                        <div className="col m12">
                            {
                                this.state.todo_list[todoType].map((v, i) => {
                                    // console.log(i, "i")
                                    // console.log(v, "v")
                                    return (
                                        (!v.edit) ?
                                            <Draggable key={i} type="todo" data={`${todoType}/${v.key}/${v.value}`}>
                                                {/* <div className="row crf_margin">
                                                    <div className="col s12">
                                                
                                                        <div className="card white  darken-4">
                                                            <div key={i} className="card-content white-text">
                                                            
                                                                <span className="card-title black-text">{v.value}</span>
                                                            </div>
                                                            <div className="card-action">
                                                                
                                                        <a type="button" onClick={this.edit_todo_item.bind(this, todoType, i)}><i className="small material-icons">edit</i></a>
                                                                <a type="button" onClick={this.delete_todo_item.bind(this, todoType, v.key, i)}><i className="small material-icons">delete</i></a>
                                                            </div>

                                                        </div>
                                                    </div>
                                                </div> */}


                                       <div class="row crf_margin">
                                          <div class="col s12 m12">
                                               <div class="card">
                                                 <div class="card-image">
                                                 <img src="http://www.absyntech.com/blog/wp-content/uploads/2017/05/Content-Writing-Company-in-Jaipur.jpg" />
                                                 </div>
                                                 <div class="card-content">
                                                  <div key={i} className="card-content white-text">                    
                                                   <span className="card-title black-text">{v.value}</span>
                                                   <hr />
                                                   <div className="deleteButton">
                                                       <a type="button" className="" onClick={this.delete_todo_item.bind(this, todoType, v.key, i)}><i className="  left black-text material-icons">delete</i></a>   
                                                   </div>    
                                                </div>
                                                
                                          </div>
                                       </div>
                                     </div>
                                </div>
            
                                            </Draggable>
                                            :
                                            <div className="row" key={i}>
                                                <form>
                                                    <div className="col s12 #ffffff white">
                                                        <div className="form-group">
                                                            <input className="form-control" type="text" ref={`${todoType.toLowerCase()}_edit_item_${i}`} defaultValue={v.value} />
                                                        </div>
                                                        <div className="col s6">
                                                            <button className="btn waves-effect purple" onClick={this.update_todo_item.bind(this, todoType, v.key, i)}><i className="small material-icons">save</i></button>
                                                        </div>
                                                        <div className="col s6">
                                                            <button className="btn waves-effect purple" onClick={this.cancel_edit.bind(this, todoType, v.key, i)}><i className="snall material-icons">cancel</i></button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                    )
                                })
                            }
                        </div>
                    </Droppable>
                </div>
            </div>
        );
    }

    render() {
       
        return (
            <div className="text-center">

<div class="navbar-fixed ">
    <nav className="light-blue lighten-1">
      <div class="nav-wrapper">
        <ul class="createBtn left hide-on-med-and-down">
        {/* <a className=" waves-effect waves-light btn modal-trigger " href="#modal1">Modal</a> */}
        <a class="createBtn btn-floating btn-large waves-effect waves-light red btn modal-trigger"   href="#modal1"><i class="material-icons">create</i></a>
        </ul>
      </div>
    </nav>
  </div>

               <div id="modal1" className="modal modalFooter ">
                 <div className="modal-content inputModal">
                  <h4> Create Your Todo </h4>
                 <div className="row ">
               <div className="input-field col s12">
              <input id="email" type="text" class="validate" ref="todo_item" />
            <label for="email">Todo</label>
            
          </div>
            </div>
           
                </div>
                <div className="modal-footer">
                <a href="#!" class="modal-action modal-close waves-effect waves-green btn-flat" onClick={this.add_todo_item}>Add</a>
             </div>
        </div>





                {/* <br />
                <form>
                    <h2> Create Your Todo </h2>
                    <div className="row">
                        <div class="input-group col s3">
                            <input placeholder="Todo Title" className="form-control" type="text" ref="todo_item" />
                            <input className="btn waves-effect purple right" type="submit" value="Add Todo" onClick={this.add_todo_item} />
                        </div>

                       
                    </div>
                </form> */}
               
                <div className="row ">
                    <div className="col-sm-3 todo_section">
                        {
                            this.todo_list_jsx(this.todoType[0])
                        }
                    </div>
                    <div className="col-sm-3 doing_section lighten-4">
                        {
                            this.todo_list_jsx(this.todoType[1])
                        }
                    </div>
                    <div className="col-sm-3 reviwe_section accent-2">
                        {
                            this.todo_list_jsx(this.todoType[2])
                        }
                    </div>
                    <div className="col-sm-3  done_section lighten-3">
                        {
                            this.todo_list_jsx(this.todoType[3])
                        }
                    </div>
                 </div>
                <div>
              </div>
            </div>
        );
    }
}

     
export default App;
