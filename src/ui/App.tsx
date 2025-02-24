import { useEffect, useMemo, useState } from "react";
import "./App.css";
import { useStatistics } from "./assets/useStatistics";
import { Chart } from "./Chart";

function App() {
  // const [count, setCount] = useState(0);
  const staticData = useStaticData();
  const statistics = useStatistics(10);
  const [activeView, setActiveView] = useState<View>("CPU");
  const cpuUsages = useMemo(
    () => statistics.map((stat) => stat.cpuUsage),
    [statistics]
  );
  const ramUsages = useMemo(
    () => statistics.map((stat) => stat.ramUsage),
    [statistics]
  );
  const storageUsages = useMemo(
    () => statistics.map((stat) => stat.storageUsage),
    [statistics]
  );
  const activeUsages = useMemo(() => {
    switch (activeView) {
      case "CPU":
        return cpuUsages;
      case "RAM":
        return ramUsages;
      case "STORAGE":
        return storageUsages;
    }
  }, [activeView, cpuUsages, ramUsages, storageUsages]);

  useEffect(() => {
    window.electron.subscribeChangeView((view) => setActiveView(view));
  }, []);

  return (
    <>
      <Header />
      <div className="main">
        <div>
          <SelectOption title="CPU" subTitle={staticData?.cpuModel ?? ''} view="CPU" data={cpuUsages} onClick={() => setActiveView('CPU')} />
          <SelectOption title="RAM" subTitle={(staticData?.totalMemoryGB.toString() ?? '') + ' GB'} view="RAM" data={ramUsages} onClick={() => setActiveView('RAM')}/>
          <SelectOption title="STORAGE"  subTitle={(staticData?.totalStorage.toString() ?? '') + ' GB'} view="STORAGE" data={storageUsages} onClick={() => setActiveView('STORAGE')}/>
        </div>
        <div className="mainGrid" >
          <Chart selectedView={activeView} data={activeUsages} maxDataPoints={10} />
        </div>
      </div>
    </>
  );
}

function SelectOption(props: {
  title: string;
  view: View;
  subTitle: string;
  data: number[];
  onClick: () => void;
}) {
  return (
    <button className="selectOption" onClick={props.onClick}>
      <div className="selectOptionTitle">
        <div>{props.title}</div>
        <div>{props.subTitle}</div>
      </div>
      <div className="selectOptionChart">
        <Chart selectedView={props.view} data={props.data} maxDataPoints={10} />
      </div>
    </button>
  );
}

function Header() {
  return (
    <header>
      <button
        id="close"
        onClick={() => window.electron.sendFrameAction("CLOSE")}
      />
      <button
        id="minimize"
        onClick={() => window.electron.sendFrameAction("MINIMIZE")}
      />
      <button
        id="maximize"
        onClick={() => window.electron.sendFrameAction("MAXIMIZE")}
      />
    </header>
  );
}

function useStaticData() {
  const [staticData, setStaticData] = useState<StaticData | null>(null);

  useEffect(() => {
    (async () => {
      setStaticData(await window.electron.getStaticData());
    })();
  }, []);

  return staticData;
}

export default App;
