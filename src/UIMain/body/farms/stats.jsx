import { useState, useEffect, useCallback } from "react";
import { poolAbi } from "../../../Resources/lib/abi";
import $ from "jquery";
import config from "../../../pools_config.json";
import { formatNumberHumanize } from "../../../utils/formatBalance";
//import Web3 from "web3";
const farmAddress = "0x738600B15B2b6845d7Fe5B6C7Cb911332Fb89949";
export default function Stats() {
  var [data, setData] = useState({ pending: 0, deposit: 0 });

  const getUserStats = useCallback(async () => {
    try {
      //if (web3.eth) {
      //await loadPending();
      if (window.account) {
        setData({
          pending: window.ts.pending,
          deposited: window.ts.deposited
        });
      } else {
        setData({
          pending: 0,
          deposited: 0
        });
      }
      //}
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    getUserStats();
    const interval = setInterval(() => {
      getUserStats();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [getUserStats]);

  {
    /*async function loadPending(params) {
    let pool = new web3.eth.Contract(poolAbi, farmAddress);
    let num = 0;
    for (let i = 0; i < config.length; i++) {
      try {
        let pending = await pool.methods
          .pendingNATIVE(config[i].id, window.account)
          .call();

        num = num + Number(pending);
      } catch (error) {}
    }
    window.ts.pending = num / 10 ** 18;
  }*/
  }

  async function harvestall() {
    let pool = new web3.eth.Contract(poolAbi, farmAddress);
    for (let i = 0; i < config.length; i++) {
      try {
        let balance = await pool.methods
          .pendingNATIVE(config[i].id, window.account)
          .call();
        if (balance > 1e8) {
          pool.methods.withdraw(config[i].id, 0).send({ from: window.account });
        }
      } catch (error) {
        console.log(error);
      }
    }
    console.log("finished");
  }

  async function changenetwork() {
    var networkOptions = $(".network-options-bar .network-selector");
    if (networkOptions.data("transitioning")) {
      return;
    }
    let url = "";
    networkOptions.data("transitioning", true);
    if (networkOptions.hasClass("index-0")) {
      networkOptions.removeClass("index-0");
      networkOptions.addClass("index-1");
      url = networkOptions.data("index-1-url");
    } else if (networkOptions.hasClass("index-1")) {
      networkOptions.removeClass("index-1");
      networkOptions.addClass("index-0");
      url = networkOptions.data("index-0-url");
    }
    setTimeout(() => {
      window.location.replace(url);
    }, 300);
  }

  return (
    <div className="stats-stripe">
      <div className="txt deposit-ttl">CHANGE NETWORK</div>
      <div class="network-options-bar">
        <div
          class="network-selector index-0"
          data-index-0-url="/" //bsc
          data-index-1-url="/" //polygon
          onClick={() => changenetwork()}
        ></div>
      </div>
      <div className="txt deposit-ttl">TOTAL DEPOSIT:</div>
      <div className={"txt total-deposit loading"}>
        {data.deposited
          ? "$" + formatNumberHumanize(data.deposited, 2)
          : "0.00"}
      </div>
      <div className="txt qbert-ttl">QBERT PENDING:</div>
      <div className="txt qbert-pending loading">
        <span className="amount">
          {data.pending ? formatNumberHumanize(data.pending, 3) : "0.000"}
        </span>
      </div>
      <div
        onClick={() => {
          harvestall();
        }}
        className="btn outlined harvest-all"
      >
        Harvest All
      </div>
    </div>
  );
}
