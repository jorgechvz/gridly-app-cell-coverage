import * as React from "react";
import { AudioWaveform, Plus, Trash } from "lucide-react";
import { MapPin, Antenna, Wifi, Ruler, Radio } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CoverageContext } from "@/context/coverage-context";
import { NavUser } from "./nav-user";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const {
    selectedTower,
    handleInputChange,
    addAntenna,
    removeAntenna,
    calculateCoverage,
    updateSelectedTowerScenario,
    updateSectorRotation,
  } = React.useContext(CoverageContext);

  return (
    <Sidebar {...props} variant="sidebar">
      <SidebarHeader className="h-16 border-b border-sidebar-border">
        <NavUser />
      </SidebarHeader>
      <SidebarContent>
        {selectedTower ? (
          <div className="py-4 px-3 space-y-4 flex flex-col">
            <Label>
              <h2 className="text-lg font-semibold">Antenna Coordinates</h2>
            </Label>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Longitude
              </Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                value={selectedTower.longitude}
                onChange={handleInputChange}
                className=" border-gray-600"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="latitude" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Latitude
              </Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                value={selectedTower.latitude}
                onChange={handleInputChange}
                className=" border-gray-600"
                step="0.0001"
              />
            </div>
            <Label>
              <h2 className="text-lg font-semibold mt-4">Antenna Parameters</h2>
            </Label>
            <div className="space-y-2">
              <Label htmlFor="frequency" className="flex items-center gap-2">
                <AudioWaveform className="w-4 h-4" />
                Frequency in MHz
              </Label>
              <Input
                id="frequency"
                name="frequency"
                type="number"
                value={selectedTower.frequency}
                onChange={handleInputChange}
                className=" border-gray-600"
                step="0.0001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ptx" className="flex items-center gap-2">
                <Antenna className="w-4 h-4" />
                Transmit Power (PTX) in dBm
              </Label>
              <Input
                id="ptx"
                name="ptx"
                type="number"
                value={selectedTower.ptx}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gtx" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Transmit Antenna Gain (GTX) in dBi
              </Label>
              <Input
                id="gtx"
                name="gtx"
                type="number"
                value={selectedTower.gtx}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grx" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Receive Antenna Gain (GRX) in dBi
              </Label>
              <Input
                id="grx"
                name="grx"
                type="number"
                value={selectedTower.grx}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="antennaHeight"
                className="flex items-center gap-2"
              >
                <Ruler className="w-4 h-4" />
                Antenna Height in meters
              </Label>
              <Input
                id="antennaHeight"
                name="antennaHeight"
                type="number"
                value={selectedTower.antennaHeight}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="maxSensitivity"
                className="flex items-center gap-2"
              >
                <Radio className="w-4 h-4" />
                Maximum Sensitivity in dBm
              </Label>
              <Input
                id="maxSensitivity"
                name="maxSensitivity"
                type="number"
                value={selectedTower.maxSensitivity}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <Separator />
            <h2 className="text-lg font-semibold">Loss Parameters</h2>
            <div>
              <Label>Margin (dB)</Label>
              <Input
                id="margin"
                name="margin"
                type="number"
                value={selectedTower.margin || 0}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div>
              <Label>Loss per cable and combiner (dB)</Label>
              <Input
                id="cableLoss"
                name="cableLoss"
                type="number"
                value={selectedTower.cableLoss || 0}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <div>
              <Label>Additional losses (dB)</Label>
              <Input
                id="additionalLoss"
                name="additionalLoss"
                type="number"
                value={selectedTower.additionalLoss || 0}
                onChange={handleInputChange}
                className=" border-gray-600"
              />
            </div>
            <Separator />
            <h2 className="text-lg font-semibold">Okumura-Hata Models</h2>
            <div className="space-y-2">
              <Select
                onValueChange={(val) => {
                  updateSelectedTowerScenario(val as "urban" | "suburban" | "rural");
                }}
                value={selectedTower.scenario || "urban"}
              >
                <SelectTrigger id="select-16">
                  <SelectValue placeholder="Select Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urban">Urban</SelectItem>
                  <SelectItem value="suburban">Sub-urban</SelectItem>
                  <SelectItem value="rural">Rural</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Campo para cambiar la rotación del sector */}
            <Separator />
            <h2 className="text-lg font-semibold">Sector Rotation</h2>
            <div className="space-y-2">
              <Label htmlFor="sectorRotation">Sector Rotation (°)</Label>
              <Input
                id="sectorRotation"
                name="sectorRotation"
                type="number"
                value={selectedTower.sectorRotation ?? 0}
                onChange={(e) =>
                  updateSectorRotation &&
                  updateSectorRotation(parseFloat(e.target.value))
                }
                className=" border-gray-600"
              />
            </div>
          </div>
        ) : (
          <div className="p-2 text-sm">
            Select an antenna to view its parameters
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <Button onClick={calculateCoverage} className="mt-4 w-full self-end">
            Calculate Coverage
          </Button>
          <div className="flex justify-between items-center gap-x-2">
            <SidebarMenuItem className="border-foreground rounded-md bg-secondary-foreground flex-1 text-white">
              <SidebarMenuButton onClick={addAntenna} className="cursor-pointer">
                <Plus />
                <span>Add Antenna</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem className="border-foreground rounded-md bg-destructive text-white">
              <SidebarMenuButton onClick={removeAntenna} className="cursor-pointer">
                <Trash />
                <span>Remove Antenna</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </div>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
