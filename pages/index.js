import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import { connectWallet, disconnect} from "../utility/wallet"
import useStore from "../utility/store"
import { useEffect, useState } from "react"
import stakingpools from '../utility/stakingpools'
import { Modal } from '../components/modal'
import { getContract, getTokenContract, convertToWei } from '../utility/wallet'




  
export default function Home() {


    
    const [account , setAccount] = useState();
    const [modalItem , setModalItem] = useState();
    const [inputAmt, setAmount] = useState();
    const [pId, setpoolId] = useState();
    const [positions, setpositions] = useState();

    const setVals = () => {
        if(modalItem){           
            setAmount(modalItem.min_deposit);
            setpoolId(modalItem.poolId);
        }
    }

    useEffect(()=>{
        setVals();
        if(account){
            getPositions();
        }
        
    })

    const stake = async ( ) => {
        
        let amount = document.getElementById("amtInput").value;
        
        if(amount < inputAmt){
            alert(`Input Min of ${inputAmt}`);
            return;
        }

        amount = convertToWei(amount);
        console.log({amount, pId})

        let contract = await getContract();
        let token = await getTokenContract();
        let approve = await token.approve( "0x2189049962f3808216932403974307451606947B", amount );
        if(approve){
         let stake = await contract.stake( amount, pId  );
        }
      
    }

    const claim_reward = async (ppid) => {
        console.log({ppid});
        //  data-toggle="modal" data-target="#exampleModalCenter" onClick={()=>{setModalItem(pool)}}
        let contract = await getContract();
        try {
            let claimreward = await contract.claimReward( ppid );
        } catch (error) {
            alert('You have no stake in this pool')
        }

    }
  
    const getPositions = async () => {
        let contract = await getContract();
        let i;
        let newArr = [];
        for (let i = 0; i < stakingpools.length; i++) {
            let stakingBalance = await contract.getUserStakingBalance(+stakingpools[i].poolId, account);
            if(stakingBalance > 0) {
                stakingpools[i].bal = ethers.utils.formatEther(stakingBalance);
               
                newArr.push(stakingpools[i])
            }
        }

        setpositions(newArr)
    }
  
    const connectWall = async () =>{
        let wallet =  await connectWallet();
        if(wallet){
          setAccount(wallet[0]);
        }
    }

    const setModal = useStore( state => state.setModalData )
    // const openModal = () => {
    //     var myModalEl = document.querySelector('#exampleModalCenter')
    //     var modal = bootstrap.Modal.getOrCreateInstance(myModalEl)
    // }

    const disconnectWallet = async () =>{
        disconnect();
        setAccount()
    }
    

  return (<>
      <header>
          <nav className="navbar navbar-expand-lg  navbar-dark">
              <a className="navbar-brand" href="#">
                  <div>
                      <span className="flogo">
                          <img height={'auto'}  src="/img/Vector.png" alt="" />
                      </span>
                      <span className="logotext" >
                          <img height={'auto'}  src="/img/FUSION PROTOCOL.png" alt="" /> 
                      </span>  
                  </div>
  
                 
                
              </a>
              <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
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
                          <span className="p_value"> $54,342</span>
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
                          <span> Other Tokens </span> 
                      </span>
  
                      <span className="tokenValue">
                          $34,920
                      </span>
  
                  </span>
  
                  <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_green"></span>
                          <span> Fusion </span> 
                      </span>
                      <span className="tokenValue">
                          $10,012
                      </span>
                  </span>
  
                  <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_blue"></span>
                          <span> Staked </span> 
                      </span>
                      <span className="tokenValue">
                          $9,210
                      </span>
                  </span>
  
                  <span className="token d-flex flex-wrap  flex-wrap  flex-wrap  flex-column">
                      <span className="tokenName d-flex flex-wrap  flex-wrap  flex-wrap  flex-row align-items-center justify-content-between">
                          <span className="eclipse" id="eclipse_purple"></span>
                          <span> Claimable </span> 
                      </span>
                      <span className="tokenValue">
                          $34,920
                      </span>
                  </span>
              </div>
  
              <div className="container progress-container">
                  <div className="progress">
                      <div className="progress-bar" role="progressbar" style={{width: "53%" ,background:"#3FB68B"}} aria-valuenow="15" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "15%", background:  "#51EBB4"}} aria-valuenow="30" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "25%" ,background: "#51C6EB",}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                      <div className="progress-bar" role="progressbar" style={{width: "7%", background: "#A386FE"}} aria-valuenow="20" aria-valuemin="0" aria-valuemax="100"></div>
                  </div>
  
                  <p style={{color: "#AFBED0", marginBottom: "16px"}}>Your Positions</p>
                    { !positions ? "" : (

                       positions.map(item => {
                        return (
                            <div className="claim-reward position-wrapper d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between">
                                            
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
                            <p className="text-light-grey">Duration: 21 July 2022 - 30 August 2022</p>
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
                                fontSize: "1.5rem"}}>{item?.bal} FUSION</span>
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
  
              <div className="staking-pool-table-wrapper">
                  <table className="table table-responsive text-white">
                      <thead style={{border: "0"}}>
                        <tr className="text-grey">
                          <th scope="col">Staking Category</th>
                          <th scope="col">Duration</th>
                          <th scope="col">Monthly ROI</th>
                          <th scope="col">Minimum Deposit</th>
                          <th scope="col">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                          {
                            stakingpools.map(pool  => {
                            return(

                                <tr >
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
                              <span>{pool?.min_deposit} (FUSION)</span>
                          </td>
                          <td>
                              
                              <button className="stake-btn"  data-toggle="modal" data-target="#exampleModalCenter" onClick={()=>{setModalItem(pool)}} > Stake </button>
                             
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


        <div className="modal fade" id="exampleModalCenter" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
              <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                  <div className="modal-header">
                  <h5 className="modal-title" id="exampleModalCenterTitle">Stake Fusion</h5>
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                      <span aria-hidden="true"> <img height={'auto'} src="/img/ex.svg" alt="" /></span>
                  </button>
                  </div>
                  <div className="modal-body">
                      <ul className="nav nav-pills" id="pills-tab" role="tablist">
                          <li className="nav-item">
                            <a className="nav-link active" id="pills-home-tab" data-toggle="pill" href="#pills-home" role="tab" aria-controls="pills-home" aria-selected="true">Staking</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link" id="pills-profile-tab" data-toggle="pill" href="#pills-profile" role="tab" aria-controls="pills-profile" aria-selected="false">Withdrawal</a>
                          </li>
                          <li className="nav-item">
                            <a className="nav-link" id="pills-contact-tab" data-toggle="pill" href="#pills-contact" role="tab" aria-controls="pills-contact" aria-selected="false">Rewards</a>
                          </li>
                        </ul>
                        <div className="tab-content" id="pills-tabContent">
                          <div className="tab-pane fade show active" id="pills-home" role="tabpanel" aria-labelledby="pills-home-tab">
                              
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between text-grey" style={{marginBottom: "10px"}}>
                                  <span>
                                      Amount
                                  </span>
                                  <span>
                                      Fusion Balance: <span style={{fontWeight:"500"}}>200,000</span>
                                  </span>
                              </div>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between align-items-center" style={{
                              background: "#0E1725",
                              borderRadius: "8px",
                              padding: "0 28.5px",
                              fontWeight: "700",
                              fontSize: "1.8rem",
                              marginBottom: "32px"
                              }}>
                                  {/* <span >20,000 <small>($1000)</small></span> */}
                                  <input type="text" id="amtInput" placeholder={`Min ${inputAmt}`} style={{
                                    background: "#0E1725",
                                    borderRadius: "8px",
                                    padding: "28.5px",
                                    fontWeight: "700",
                                    fontSize: "1.8rem",
                                    border: "none",
                                    outline: "none",
                                    color: "#FFF"
                                  }} />
                                  <span >FSN</span>
                              </div>
  
                              <div className="staking-category d-flec flex-column" style={{padding: "20px", background: "#0E1725", borderRadius: "9.75964px", marginBottom: "32px"}}>
                                  <span className="d-flex flex-wrap  flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Staking Category</span>
                                      <span>Silver Pool</span>
                                  </span>
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Amount 
                                      <span> 
                                          <img   height="20px" src="/img/info.png" alt="" />
                                      </span>
                                      </span>
                                      <span>20,000 FSN ($1,000)</span>
                                  </span>
  
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Duration 
                                          <span> 
                                              <img   height="20px" src="/img/info.png" alt="" />
                                          </span>
                                      </span>
                                      <span>30 Days</span>
                                  </span>
                                  <span className="d-flex flex-wrap  flex-wrap  justify-content-between" style={{marginBottom:"18px"}}>
                                      <span>Transaction Fee</span>
                                      <span>$2 <span style={{color:"rgba(171, 146, 252, 1)"}}> (Fast) </span> <span>
                                          <img   height={'auto'} src="/img/downarrow.png" alt="" />
                                      </span> </span>
                                  </span>
                              </div>
  
                              <div className="notice d-flex flex-wrap  flex-wrap " style={{background: "#0E1725", borderRadius: "8px" ,marginBottom: "32px", padding: "18px 33px"}}>
                                  <div className="img d-flex flex-wrap  flex-wrap  justify-content-center align-items-center" style={{position: "relative", marginRight: "25px"}}>
                                      <img height={'auto'}   style={{position: "absolute"}} src="/img/exclaim.png" alt="" />
                                      <img height={'auto'}  src="/img/shield.png" alt="" />
  
                                  </div>
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span style={{fontWeight: "700", fontSize: "1.1rem"}}>Staking $1000 for 30 days</span>
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
                          <div className="tab-pane fade" id="pills-profile" role="tabpanel" aria-labelledby="pills-profile-tab">...</div>
                          <div className="tab-pane fade" id="pills-contact" role="tabpanel" aria-labelledby="pills-contact-tab">
  
                              <p style={{color: "rgba(175, 190, 208, 1)"}}>Your Positions</p>
                              <div className="position-wrapper d-flex flex-wrap  flex-wrap  justify-content-between" style={{background: "#0E1725"
                              ,borderRadius: "8px", marginBottom: "32px", padding: "28px"}}>
                                  
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column">
                                      <span className="d-flex flex-wrap  flex-wrap  align-items-center">
                                          <span className="">
                                              <img height={'auto'}  src="/img/spaceship.png" alt="" />
                                          </span>
                                          <span className="text-white" style={{fontWeight: "700",
                                          fontSize: "24px", margin: "0 10px"}}>
                                              Silver Fusion
                                          </span>
                                          <span>
                                              <img height={'auto'}  src="/img/open.png" alt="" />
                                          </span> 
                                      </span>
                                      <p className="text-light-grey" style={{fontWeight: "400"}}>Duration: 21 July 2022 - 30 August 2022</p>
                                  </div>
              
  
                                  <div className="d-flex flex-wrap  flex-wrap  flex-column" >
                                      <span className="text-light-grey"> Your Stake</span>
                                      <span> 
                                          <span className="text-white" style={{fonWeight: "700",
                                          fontSize: "1.5rem"}}>29,302 FUSION</span>
                                          <span className="text-light-grey" style={{fontWeight: "400"}}>$9201</span>
                                      </span>
                                  </div>
              
              
                              </div>
  
                              <p style={{color: "rgba(175, 190, 208, 1)"}}>Your Positions</p>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap " style={{marginBottom: "32px", fontWeight: "700",
                              fontSize: "36px", background: "#0E1725", borderRadius: "8px", padding: "28px"}}>
                                  <span className="text-white">2,291 FSN</span>
                              </div>
  
                              <div className="d-flex flex-wrap  flex-wrap  flex-wrap ">
                                  <button className="btn flex-grow-1 stake-btn" style={{fontWeight: "800", fontSize: "24px"}} onClick={()=>{claim_reward(pId)}}>
                                      Claim reward
                                  </button>
                              </div>
  
                          </div>
                        </div>
                        
                  </div>
              </div>
              </div>
          </div>
    
      </main>
  </>)
}
