import { execSync } from "child_process"

function getMac(): string {
  try {
    const m = execSync("cat /sys/class/net/eth0/address", { encoding: "utf-8" })
    if (m.length > 0) {
      return m
    }
  } catch (err) {
    console.log("Could not get MAC address of eth0 interface.")
  }
  return "00:00:00:00:00:00"
}

function getSerial(): string {
  try {
    const s = execSync("cat /proc/cpuinfo | grep Serial | cut -d ' ' -f 2", { encoding: "utf-8" })
    if (s.length > 0) {
      return s
    }
  } catch (err) {
    console.log("Could not get serial number of device.")
  }
  return "100000000unknown"
}

const mac = getMac()
const serial = getSerial()

export { mac, serial }
