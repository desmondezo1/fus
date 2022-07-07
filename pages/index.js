import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { connectWallet, disconnect} from "../utility/wallet"
import useStore from "../utility/store"
import { useEffect, useState } from "react"
import stakingpools from '../utility/stakingpools'
import { Modal } from '../components/modal'
import { getContract,switchNetwork, listenForChain, getTokenContract, convertToWei, getWalletBalance, convertToEther, CONTRACT_ADDRESS } from '../utility/wallet'




  
export default function Home() {


    
    const [account , setAccount] = useState();
    const [modalItem , setModalItem] = useState();
    const [inputAmt, setAmount] = useState();
    const [warnAmt, setWarnAmount] = useState();
    const [pId, setpoolId] = useState();
    const [positions, setpositions] = useState();
    const [userBalance, setUserBalance] = useState();
    const [totalStaked, setTotalStaked] = useState();
    const [totalStakeHolders, setTotalStakeHolders] = useState();
    const [siteMessage, setSiteMessage] = useState();
    const [rightNet, setRightNet] = useState(false);
    const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID;
    const setModal = useStore( state => state.setModalData )
    
    const setVals = async () => {
        if(modalItem){           
            setAmount(modalItem.min_deposit);
            setpoolId(modalItem.poolId);
        }
        
    }
    const getTotalstkd = async () =>{
        let contract = await getContract();
        let totalStkd = await contract.getTotalStaked();
        let holders = await contract.getTotalStakeHolderCount();
        setTotalStaked(convertToEther(totalStkd));
        setTotalStakeHolders(holders);
    }
    const setBal = async () => {
        let bal = await getWalletBalance();
         setUserBalance(bal);
    }

    useEffect( ()=>{
        
        if(account){
            switchNetwork();
            if (!checknetwork(false)) {
                toast.error(`WRONG NETWORK! Please switch to ${ process.env.NEXT_PUBLIC_NETWORK_NAME}`)
                console.log(siteMessage);
            }else{
                setRightNet(true)
            }
        }
    },[])

    useEffect(()=>{
        if (!checknetwork()) {
            setRightNet(false);
         }else{
            setRightNet(true)
         }
    })

    useEffect( ()=>{
        if(account && rightNet){
            getPositions();               
            setBal();   
            setVals();
            getTotalstkd();

        }

        //  (async () => {
        //     if(localStorage.getItem("WEB3_CONNECT_CACHED_PROVIDER")) await connectWall();
        // })()
       
    })



    function getRPCErrorMessage(err){
        var open = err.stack.indexOf('{')
        var close = err.stack.lastIndexOf('}')
        var j_s = err.stack.substring(open, close + 1);
        var j = JSON.parse(j_s);
        var reason = j.data[Object.keys(j.data)[0]].reason;
        return reason;
    }


    const stake = async ( ) => {
        
        let amount = document.getElementById("amtInput").value;
        if (!account) {
            toast.info(`Please connect wallet`)
            // alert();
            return;
        }
        if(+amount < +inputAmt){
            toast.info(`Input Min of ${inputAmt}`)
            // alert();
            return;
        }
        console.log({amount,userBalance});
        if (+amount > +userBalance) {
            toast.error(`You don't have enough tokens for this transaction`);
            // alert();
            return;
        }


        amount = await convertToWei(amount);
        console.log({amount, pId})

        let contract = await getContract();
        let token = await getTokenContract();
        try {
            let approve = await token.approve( CONTRACT_ADDRESS, amount ).then( async res => {
                if(res){
                let stake = await contract.stake( amount, pId  );
                }
            });

        } catch (error) {
            toast.error(error.message)
        }
      
    }

    const claim_reward = async (ppid) => {
        console.log({ppid});
        //  data-toggle="modal" data-target="#exampleModalCenter" onClick={()=>{setModalItem(pool)}}
        let contract = await getContract();
        try {
            let claimreward = await contract.claimReward( ppid );
        } catch (error) {
            toast.error(error.mesage)
            // alert(error)
            // alert('You have no stake in this pool')
        }

    }

    function formatDate(timestamp, days=null) {
        let monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        let dateObj = new Date(timestamp * 1000);
        if (days == null) {
            let month = monthNames[dateObj.getMonth() + 1];
            let year = dateObj.getFullYear();
            let date =  dateObj.getDate();
            return `${date} ${month} ${year}`;
        }
        dateObj.setDate(dateObj.getDate() + days);
        let month = monthNames[dateObj.getMonth() + 1];
        let year = dateObj.getFullYear();
        let date =  dateObj.getDate();
        return `${date} ${month} ${year}`;

        // return dateObj;
    }
  
    const getPositions = async () => {
        // if(!checknetwork()){
        //     return;
        // }

        let contract = await getContract();
        let i;
        let newArr = [];
        
        for (let i = 0; i < stakingpools.length; i++) {
            try {
                 let stakingBalance = await contract.getUserStakingBalance(+stakingpools[i].poolId, account);
                if(stakingBalance > 0) {
                    stakingpools[i].bal = ethers.utils.formatEther(stakingBalance);
                    let reward_bal = await contract.calculateUserRewards(account, stakingpools[i].poolId);
                    let stakeTime = await contract.getLastStakeDate( stakingpools[i].poolId,account);
                    stakeTime = stakeTime.toString();
                    let startDate = formatDate(+stakeTime);
                    let endDate =  formatDate(+stakeTime, +stakingpools[i].duration);
                    stakingpools[i].date = startDate + " - " + endDate;
                    stakingpools[i].end_date = endDate;
                    stakingpools[i].reward_bal = convertToEther(reward_bal);
                    newArr.push(stakingpools[i])
                }
            } catch (err) {
                toast.error(err.message)
    
            }
        }

        setpositions(newArr)
    }

    const checknetwork = (istoast=true) => {
        if (typeof window !== "undefined") {
            if (!window.ethereum?.networkVersion) {
                return;
            }
            if (+window.ethereum?.networkVersion !== +CHAIN_ID) {
                console.log('enters',window.ethereum?.networkVersion , CHAIN_ID)
                console.log(window.ethereum.networkVersion)
                console.log( CHAIN_ID)
                    if (+CHAIN_ID == 56) {
                        if(istoast){
                              toast.info("Please switch network to BSC mainet ");
                        }
                      
                    }

                    if(+CHAIN_ID == 97){
                        if (istoast) {
                            toast.info("Please switch network to BSC Testnet ");
                        }
                        
                    }
                return false;
            }

            return true;
         }
    }
  
    const connectWall = async () =>{
        //  if (!checknetwork()) {
        //     return;
        //  }
        disconnectWallet();
         let wallet =  await connectWallet();
            if(wallet){
            setAccount(wallet[0]);
            toast.success('connected!')
            }  

    }

   

    const disconnectWallet = async () =>{
        disconnect();
        setAccount();
        localStorage.removeItem("WEB3_CONNECT_CACHED_PROVIDER")
    }

    const onChange = event => {
        console.log("onChange called");
        setWarnAmount(event.target.value);
    };
    

  return (<>
      <header>
      <ToastContainer />
      {!siteMessage? "" : (<div className='d-flex justify-contents-center align-items-center' style={{display: "flex", background: "orange", padding: "20px"}}><b>{siteMessage}</b></div>)}
          <nav className="navbar navbar-expand-lg  navbar-dark">
              <a  className="navbar-brand" href="#">
                  <div>
                      {/* <span className="flogo">
                          <img height={'auto'}  src="/img/Vector.png" alt="" />
                      </span> */}
                      <span className="logotext" >
                          <img height={'auto'}  src="/img/FUSION PROTOCOL.png" alt="" /> 
                      </span>  
                  </div>
  
                 
                
              </a>
              <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="collapse navbar-collapse" id="navbarNav">
                <ul className="navbar-nav">
                  <li className="nav-item active">
                    <a className="nav-link" href="#">Stake <span className="sr-only">(current)</span></a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link" href="#">Portfolio</a>
                  </li>
                  <li className="nav-item">
                   <a className="nav-link" href="#">Leaderboard</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">Buy FSN</a>
                  </li>
                  <li className="nav-item">
                    <a className="nav-link disabled" href="#">Docs</a>
                  </li>
                </ul>
                  
                  <button className="mr-sm-2 mr-lg-0 mr-md-0 connectWallet" onClick={()=>{ !account ? connectWall() :  disconnectWallet()}}>
                     { !account ? "Connect Wallet" : account.substring(0, 7)}
                  </button>
              </div>
  
            </nav>
      </header>
      <main className="container">
  
          <section>
              <div className="text-white" style={{marginBottom: "64px"}}>
                  <h1>Fusion Staking</h1>
                  <p className="text-grey">Earn return on investment by depositing and staking Fusion Coin</p>
              </div>
  
              <div className="info-wrapper">
                  <div className="portfolio_value d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between">
                      <span className="value_wrapper d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center">
                          <span className="p_value_label">Portfolio Value : &nbsp;</span>
                          <span className="p_value"> {!userBalance?"0":userBalance} FSN</span>
                      </span>
  
                      <button className="btn buy-coin-btn text-white">
                          Buy Fusion Coin
                      </button>
                  </div>
              </div>
  
              <div className=" container other-tokens d-flex flex-wrap  flex-wrap  flex-wrap ">
                  <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_green"></span>
                          <span> Total Stakers </span> 
                      </span>
  
                      <span className="tokenValue">
                          {!totalStakeHolders? 0: totalStakeHolders * 1}
                      </span>
  
                  </span>
  
                  <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_green"></span>
                          <span>Total Fusion Staked </span> 
                      </span>
                      <span className="tokenValue">
                         {!totalStaked? "0": totalStaked * 1}
                      </span>
                  </span>
  
                  {/* <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_blue"></span>
                          <span> Staked </span> 
                      </span>
                      <span className="tokenValue">
                          $9,210
                      </span>
                  </span> */}
  
                  {/* <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_purple"></span>
                          <span> Claimable </span> 
                      </span>
                      <span className="tokenValue">
                          $34,920
                      </span>
                  </span> */}
              </div>
  
              <div className="container progress-container">
                  <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{width: "53%" ,background:"#3FB68B"}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "15%", background:  "#51EBB4"}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "25%" ,background: "#51C6EB",}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "7%", background: "#A386FE"}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
  
                  <p style={{color: "#AFBED0", marginBottom: "16px"}}>Your Positions</p>
                  { !positions || positions?.length == 0 ?(<p style={{color: "#fff"}}> You currently have no stake in any pool </p>) : "" }
                    { !positions ? "" : (

                       positions.map((item, index) => {
                        return (
                        <div key={index} className="claim-reward position-wrapper d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between">
                                            
                        <div className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                            <span className="d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center" style={{height: "38px"}}>
                                <span className="">
                                    <img  height={'auto'} src={item?.image} alt="" />
                                </span>
                                <span className="text-white" style={{fontWeight: "700",
                                fontSize: "1.5rem",
                                margin: "0 10px"
                                }}>
                                    {item?.name}
                                </span>
                                <span>
                                    <img  height={'auto'} src="/img/open.png" alt="" />
                                </span> 
                            </span>
                            <p className="text-light-grey"> Duration:{" "} {item?.date}</p>
                        </div>

                        <div className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                            <span className="text-light-grey"> Return on Investment</span>
                            <span style={{color: "rgba(81, 235, 180, 1)",
                            fontWeight: "700",
                            fontSize: "1.5rem"}}> {item?.roi}</span>
                        </div>

                        <div className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                            <span className="text-light-grey"> Your Stake</span>
                            <span>
                                <span className="text-white" style={{
                                fontWeight: "700",
                                fontSize: "1.5rem"}}>{item?.bal * 1} FUSION</span>
                                <span className="text-light-grey"></span>
                            </span>
                        </div>

                        <div className="d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                            <button className=" claim-reward-btn text-white " onClick={()=>{claim_reward(item?.poolId)}} >
                                Claim Reward
                            </button>
                        </div>

                        </div>

                        )
                       } )
                    )}

              </div>
              
          </section>
  
          <section className="staking-pool">
              <h2 className="text-white staking-pool-heading" >
                  Fusion Staking Pool
              </h2>
  
              <div className="staking-pool-table-wrapper table-responsive">
                  <table className="table text-white">
                      <thead style={{border: "0"}}>
                        <tr className="text-grey">
                          <th scope="col">Staking Category</th>
                          <th scope="col">Duration</th>
                          <th scope="col">APY</th>
                          <th scope="col">Minimum Deposit</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                          {
                            stakingpools.map((pool, index)  => {
                            return(

                                <tr key={index}>
                          <td>
                              <span className="d-flex flex-wrap  flex-wrap  flex-wrap  align-items-center ">
                                  <span style={{marginRight: "16px"}}><img height={'auto'}  src={pool?.image} alt="" /> </span>
                                  <span>{pool?.name}</span>
                              </span>
                          </td>
                          <td> 
                              <span>{pool?.duration} Days</span> 
                          </td>
                          <td>
                              <span>{pool?.roi}</span>
                          </td>
                          <td>
                              <span>{pool?.min_deposit} FSN</span>
                          </td>
                          <td>
                              
                              <button className="stake-btn" data-bs-toggle="modal" data-bs-target="#exampleModal" onClick={()=>{setModalItem(pool)}} > Stake </button>
                             
                          </td>
                        </tr>
                        
  
                            )
                        })
                          }
                        
                       
                      </tbody>
                    </table>
              </div>
          </section>
        {/* MODAL SECTION  */}


        <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                  <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalCenterTitle">Stake Fusion</h5>
                  <button type="button" className="btn-close btn-close-white" style={{fontSize: "1.3rem"}} data-bs-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true"> 
                      {/* <img height={'auto'} src="/img/ex.svg" alt="" /> */}
                      </span>
                  </button>
                  </div>
                  <div className="modal-body">
                      <ul className="nav nav-pills" id="pills-tab" role="tablist">
                          <li className="nav-item">
                            <a className="nav-link active" id="pills-home-tab" data-bs-toggle="pill" data-bs-target="#pills-home"  role="tab" aria-controls="pills-home" aria-selected="true">Staking</a>
                          </li>
                          {/* <li className="nav-item">
                            <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Withdrawal</a>
                          </li> */}
                          <li className="nav-item">
                            <a className="nav-link" id="pills-contact-tab" data-bs-toggle="pill" data-bs-target="#pills-contact" role="tab" aria-controls="pills-contact" aria-selected="false">Rewards</a>
                          </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                          <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                              
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between text-grey" style={{marginBottom: "10px"}}>
                                  <span>
                                      Amount
                                  </span>
                                  <span>
                                      Fusion Balance: <span style={{fontWeight:"500"}}>{!userBalance?"0":userBalance}</span>
                                  </span>
                              </div>
  
                              <div className="d-flex justify-content-between align-items-center" style={{
                              background: "#0E1725",
                              borderRadius: "8px",
                              padding: "0 28.5px",
                              fontWeight: "700",
                              fontSize: "1.5rem",
                              marginBottom: "32px"
                              }}>
                                  {/* <span >20,000 <small>($1000)</small></span> */}
                                  <input type="number" id="amtInput" placeholder={`Min ${inputAmt}`} onChange={onChange} style={{
                                    background: "#0E1725",
                                    borderRadius: "8px",
                                    padding: "28.5px",
                                    fontWeight: "700",
                                    fontSize: "1.3rem",
                                    border: "none",
                                    width: "100%",
                                    outline: "none",
                                    color: "#FFF"
                                  }} />
                                  <span >FSN</span>
                              </div>
  
                              <div className="staking-category d-flec flex-column" style={{padding: "20px", background: "#0E1725", borderRadius: "9.75964px", marginBottom: "32px"}}>
                                  <span className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Staking Category</span>
                                      <span>{modalItem?.name}</span>
                                  </span>
  
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Duration 
                                          <span> 
                                              <img   height="20px" src="/img/info.png" alt="" />
                                          </span>
                                      </span>
                                      <span>{modalItem?.duration} Days</span>
                                  </span>
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>APY</span>
                                      <span>{modalItem?.roi} <span style={{color:"rgba(171, 146, 252, 1)"}}>  </span> <span>
                                          {/* <img   height={'auto'} src="/img/downarrow.png" alt="" /> */}
                                      </span> </span>
                                  </span>
                              </div>
  
                              <div className="notice d-flex flex-wrap  flex-wrap " style={{background: "#0E1725", borderRadius: "8px" ,marginBottom: "32px", padding: "18px 33px"}}>
                                  <div className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center" style={{position: "relative", marginRight: "25px"}}>
                                      <img height={'auto'}   style={{position: "absolute"}} src="/img/exclaim.png" alt="" />
                                      <img height={'auto'}  src="/img/shield.png" alt="" />
  
                                  </div>
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span style={{fontWeight: "700", fontSize: "1.1rem"}}>Staking {!warnAmt?0:warnAmt} FSN for {!modalItem?.duration? 0: modalItem?.duration} days</span>
                                      <span style={{color:"#AFBED0", fontWeight: "400"}}>There’s a 20% penalty for premature withdrawal</span>
                                  </div>
                              </div>
                              <div className="d-flex flex-wrap  flex-wrap ">
                                  <button className="btn flex-grow-1 stake-btn" style={{fontWeight: "800", fontSize: "24px"}} onClick={()=>{
                                    stake();
                                  }}>
                                      Stake
                                  </button>
                              </div>
                              
  
                          </div>
                          {/* <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">...</div> */}
                          <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
  
                              <p style={{color: "rgba(175, 190, 208, 1)"}}>Your Positions</p> 
                              
                            {!positions || positions?.length == 0 ? (<p> You currently have no stake in any pool </p>) : "" }
                            
                            { positions?.filter( item => {
                                if(item?.poolId == modalItem?.poolId){
                                    return item;
                                }
                            }).map((val, index) => {
                                return (<>
                                    <div key={`item`+index} className="position-wrapper d-flex flex-wrap  flex-wrap  justify-content-between" style={{background: "#0E1725"
                                    ,borderRadius: "8px", marginBottom: "32px", padding: "28px"}}>
                                        
                                        <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                            <span className="d-flex flex-wrap  flex-wrap  align-items-center">
                                                <span className="">
                                                    <img height={'auto'}  src="/img/spaceship.png" alt="" />
                                                </span>
                                                <span className="text-white" style={{fontWeight: "700",
                                                fontSize: "24px", margin: "0 10px"}}>
                                                    {val?.name}
                                                </span>
                                                <span>
                                                    <img height={'auto'}  src={val?.image} alt="" />
                                                </span> 
                                            </span>
                                            <p className="text-light-grey" style={{fontWeight: "400"}}>Duration: {" "} {val?.date}</p>
                                        </div>
                    
        
                                        <div className="d-flex flex-wrap  flex-wrap  flex-column" >
                                            <span className="text-light-grey"> Your Stake</span>
                                            <span> 
                                                <span className="text-white" style={{fonWeight: "700",
                                                fontSize: "1.5rem"}}>{val?.bal*1} FUSION</span>
                                                {/* <span className="text-light-grey" style={{fontWeight: "400"}}>$9201</span> */}
                                            </span>
                                        </div>
                    
                    
                                  </div>
                           

  
                              <p key={`position`+index} style={{color: "rgba(175, 190, 208, 1)"}}>Your Rewards</p>
  
                              <div key={`bal`+index} className="d-flex flex-wrap  flex-wrap  flex-wrap " style={{marginBottom: "32px", fontWeight: "700",
                              fontSize: "36px", background: "#0E1725", borderRadius: "8px", padding: "28px"}}>
                                <img src='/img/logo.png' />
                                  <span className="text-white" style={{marginLeft: "16px"}}>{val?.reward_bal * 1} FSN</span>
                              </div>
    
                              <div key={`warn`+index} className="notice d-flex " style={{background: "#0E1725", borderRadius: "8px" ,marginBottom: "32px", padding: "18px 33px"}}>
                                  <div className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center" style={{position: "relative", marginRight: "25px"}}>
                                      <img height={'auto'}   style={{position: "absolute"}} src="/img/exclaim.png" alt="" />
                                      <img height={'auto'}  src="/img/shield.png" alt="" />
  
                                  </div>
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span style={{fontWeight: "700", fontSize: "1.1rem"}}>Due date to claim rewards is {val?.end_date}</span>
                                      <span style={{color:"#AFBED0", fontWeight: "400"}}>Premature withdrawal will make you lose all rewards in this pool, and 20% of your staked tokens</span>
                                  </div>
                              </div>

                              <div key={`claim`+index} className="d-flex flex-wrap  flex-wrap  flex-wrap ">
                                  <button className="btn flex-grow-1 stake-btn" style={{fontWeight: "800", fontSize: "24px"}} onClick={()=>{claim_reward(pId)}}>
                                      Claim reward
                                  </button>
                              </div>
                            </>)
                            }) }
                            
                          </div>
                        </div>
                        
                  </div>
              </div>
              </div>
          </div>
    
      </main>
  </>)
}
