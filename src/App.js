import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import $ from "jquery";
import {obj} from "./db/database";
import {prevTotalCreditsOptions} from './db/database';
function App() {

  const prevTotalCredits=useRef(0);
  const currSem= useRef(0);
  const prevCpi=useRef(0.0);
  const branch= useRef("null");
  const semOptions = [1, 2, 3, 4, 5, 6, 7, 8];
  const branchOptions = ["ar","bme","bt","ca","che","civ","cse","ece","ele","it","me","min","mme"];
  const mainObj=useRef({});
  const pointToGrade={10:"O",9:"A",8:"B",7:"C",6:"D",5:"E",4:"F",3:"F",2:"F",1:"F",0:"F"}
  const gradeToPoint={"O":10,"A":9,"B":8,"C":7,"D":6,"E":5,"F":4};
  let flagFirst=true;

  useEffect(() => {
    startingWindow();
  }, []);

  const startingWindow=()=>{
    $(".calculator--section").hide();
    $(".options").hide();
    $(".welcome--screen").on("click", (e) => {
      $(".welcome--screen").fadeOut();
      $("#cursor").fadeOut();
      setTimeout(() => {
        $(".calculator--section").fadeIn();
        afterWindow();
      }, 500);
    });
  }

  const afterWindow=()=>{
    setTimeout(()=>{
      showBranchPrompt();
    },1000)
  }


  const showBranchPrompt=()=>{
    setTimeout(() => {
      $(".container").addClass("blurAll").fadeOut();
      getOptionsReady("prompt", branchOptions);
      $(".options").fadeIn();
      $(".options--item").on("click",(e)=>{
        branch.current=branchOptions[parseInt(e.target.id)];
        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        if(flagFirst){
          setTimeout(()=>{
            showSemPrompt();
          },1000)
        }
      })
    }, 300);
  }

  const showSemPrompt = () => {
    setTimeout(() => {
      $(".container").addClass("blurAll").fadeOut();
      getOptionsReady("menu--icon", semOptions);
      $(".options").fadeIn();
      $(".options--item").on("click",(e)=>{
        currSem.current=parseInt(e.target.id)+1;
        $("#current--sem").html(`sem-${currSem.current}`);
        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        prevTotalCredits.current=calculatePrevTC(branch.current,currSem.current);
        $("#prev--total--credits").html(prevTotalCredits.current);
        if(flagFirst){
          setTimeout(()=>{
            showPrevCpiPrompt();
          },1000)
        }
      })
    }, 300);
  };

  const showPrevCpiPrompt=()=>{
    setTimeout(() => {
      $(".container").addClass("blurAll").fadeOut();
      getOptionsReady("prev--sem--cpi", []);
      $(".options").fadeIn();
      $("#prevCpi--btn").on("click",()=>{
        let pc=$("#prev--sem--cpi--input[name='pci']").val();
        if(parseFloat(pc))prevCpi.current=parseFloat(pc);
        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        if(flagFirst){
          setTimeout(() => {
            findObj();
          }, 1000);
        }
      })
    }, 300);
  }

  const showPrevSemTotalCreditsPrompt=()=>{
    setTimeout(()=>{
      $(".container").addClass("blurAll").fadeOut();
      getOptionsReady("prev--sem--total--credits", []);
      $(".options").fadeIn();
      $("#prevCredit--btn").on("click",(e)=>{
        let pc=$("#prev--sem--totalCreditPoints--input[name='pcii']").val();
        if(parseInt(pc))prevTotalCredits.current=parseInt(pc);
        $("#prev--total--credits").html(`${prevTotalCredits.current}`);
        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        if(flagFirst){
          findObj();
        }
      })
    },300);
  }

  const findObj=()=>{
    let br=branch.current;
    mainObj.current=obj[br][0][`sem${currSem.current}`];
    $(".item").remove();
    for(let items in mainObj.current){
      $(".item--section").prepend(`<div class="item" id="itemNo${items}">
      <span id="subject${items}"class="subitem subject">${mainObj.current[items].name}</span>
      <span id="credit${items}"class="subitem acredit">${mainObj.current[items].credits}</span>
      <span id="expectedGrade${items}" class="subitem ecredit">${pointToGrade[mainObj.current[items].expectedGrade]}</span>
      </div>`)
    }
    flagFirst=false;
    checkForEdit();
  }

  const checkForEdit=()=>{
    $(".subitem").on("click",(e)=>{
      let element=e.target.id;
      let eleIndex=parseInt(element[element.length-1]);
      getOptionsReady("subitems",[eleIndex]);
      showEditPrompt(eleIndex);
    })
    $(".lower-btn").on("click",(e)=>{
      if(prevCpi!==0.0 && prevTotalCredits!==0){
        calculateCpi();
      }
    })
  }

  const getOptionsReady = (id,arr) => {
    $(".options").empty();
    if (id === "menu--icon") {
      $(".options").append(`<div class="options--item--headline" >Select your current sem:</div>`);
      arr.map((item, index) => {
        $(".options").append(
          `<span class="options--item" id="${index}" >${item}</span>`
        );
      });
    }
    else if(id==="prev--sem--total--credits"){
      $(".options").append(
        `<div class="options--item--headline" >What is your total Credit points from sem ${1} to sem ${(currSem.current===1)?1:currSem.current-1}:</div>
         <input id="prev--sem--totalCreditPoints--input" name="pcii" placeholder="XXX" type="text" />
         <submit id="prevCredit--btn">Enter</submit>`
      );
    }
    else if(id==="prompt"){
      $(".options").append(
        `<div class="options--item--headline" >Select your branch:</div>`
      );
      arr.map((item,index)=>{
        $(".options").append(
          `<span class="options--item" id="${index}" >${item}</span>`
        );
      })
    }
    else if(id==="prev--sem--cpi"){
      $(".options").append(
        `<div class="options--item--headline" >What was your last sem CPI:</div>
         <input id="prev--sem--cpi--input" name="pci" placeholder="X.XX" type="text" />
         <submit id="prevCpi--btn">Enter</submit>`
      );
    }
    else if(id==="subitems"){
      $(".options").append(
        `<div class="options--item--headline" >Edit or delete the dataset</div>
        <input id="edit1" class="edit--inputs" placeholder=${mainObj.current.at(arr.at(0)).name} />
        <input id="edit2" class="edit--inputs" placeholder=${mainObj.current.at(arr.at(0)).credits} />
        <input id="edit3" class="edit--inputs" placeholder=${mainObj.current.at(arr.at(0)).expectedGrade} />
        <submit id="edit--btn">Edit ✒️</submit><submit id="delete--btn">Delete ☠️</submit>`
      );
    }
  };


  const showEditPrompt=(e)=>{
    setTimeout(() => {
      $(".container").addClass("blurAll").fadeOut();
      $(".options").fadeIn();
      // edit btn
      $("#edit--btn").on("click",()=>{
        let nname=$("#edit1").val(), ncredits=$("#edit2").val(),nexpectedGrades=$("#edit3").val();
        if(parseInt(ncredits))ncredits=parseInt(ncredits);
        if(parseInt(nexpectedGrades))nexpectedGrades=parseInt(nexpectedGrades);
        if(nname)mainObj.current[e].name=nname;
        if(!isNaN(ncredits)&&ncredits)mainObj.current[e].credits=ncredits;
        if(!isNaN(nexpectedGrades)&&nexpectedGrades)mainObj.current[e].expectedGrade=nexpectedGrades;
        else{
          let str1=$("#edit3").val();
          if(str1>="A" && str1<="F"){
            mainObj.current[e].expectedGrade=gradeToPoint[str1];
          }
        }

        $(`#subject${e}`).html(mainObj.current[e].name);
        $(`#credit${e}`).html(mainObj.current[e].credits);
        $(`#expectedGrade${e}`).html(pointToGrade[mainObj.current[e].expectedGrade]);

        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        checkForEdit();
      })

      // delete btn
      $("#delete--btn").on("click",()=>{
        delete mainObj.current[e];
        $(`#itemNo${e}`).remove();
        $(".options").fadeOut();
        $(".container").fadeIn().removeClass("blurAll");
        checkForEdit();
      })

    }, 300);
  }

  const calculatePrevTC=(brn,sem)=>{
    const tempObj=prevTotalCreditsOptions[brn];
    let res=0;
    for(let i in tempObj){
      if(i<sem)res+=tempObj[i];
    }
    return res;
  }

  const calculateCpi = ()=>{
    let currTC=0.0;
    let prevTC=prevTotalCredits.current;
    let totalGP=0.0;
    let prevGP=prevTC * parseFloat(prevCpi.current);
    for(let item in mainObj.current){
      currTC+=(parseFloat(mainObj.current[item].credits));
      totalGP+=(parseFloat(mainObj.current[item].credits) * parseFloat(mainObj.current[item].expectedGrade));
    }
    // result 👇
    let currCPI=((prevGP+totalGP)/(prevTC+currTC));
    $("#res").text(`${currCPI.toFixed(2)}`);
    checkForEdit();
  }


  return (
    <>
      <div className="container">
        <div className="welcome--screen">
          <h1>Wanna know your score of this semester?</h1>
          <FontAwesomeIcon
            id="cursor"
            icon={["fa-solid", "fa-hand-pointer"]}
            fade
          ></FontAwesomeIcon>
        </div>
        <div className="calculator--section">
          <div className="calculator--body">
            <FontAwesomeIcon
              id="menu--icon"
              icon="fa-solid fa-circle-chevron-down"
              onClick={showSemPrompt}
            />
            <span id="current--sem">sem-X</span>

            <div id="display--screen">
              <span id="output--headline">Your CPI</span>
              <span id="arrow">
                {"========>"} <span id="res">X.XX</span>
              </span>
            </div>

            <div className="previous--sem--input" id="prev--sem--total--credits" onClick={showPrevSemTotalCreditsPrompt} >
              prev sem total credits : <span id="prev--total--credits">XX</span>
            </div>

            <div className="subjects--input--section">
              <div className="labels">
                <span className="subject--name">Subject name</span>
                <span className="total--credits">Actual credits</span>
                <span className="expected--grade">Expected credits</span>
              </div>

              <div className="item--section">
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="item">
                  <span id="subject1" className="subject subitem">
                    Machine Learning
                  </span>
                  <span id="subject1_credit" className="acredit subitem">
                    4
                  </span>
                  <span
                    id="subject1_expected_credit"
                    className="ecredit subitem"
                  >
                    A
                  </span>
                </div>
                <div className="lower-btn">
                <FontAwesomeIcon icon="fa-solid fa-magnifying-glass" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="options"></div>
    </>
  );
}

export default App;
