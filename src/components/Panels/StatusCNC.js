/*
 StatusCNC.js - ESP3D WebUI component file

 Copyright (c) 2021 Luc LEBOSSE. All rights reserved.

 This code is free software; you can redistribute it and/or
 modify it under the terms of the GNU Lesser General Public
 License as published by the Free Software Foundation; either
 version 2.1 of the License, or (at your option) any later version.
 This code is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 Lesser General Public License for more details.
 You should have received a copy of the GNU Lesser General Public
 License along with This code; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

import { Fragment, h } from "preact"
import { T } from "../Translations"
import { Layers, PlayCircle, PauseCircle, StopCircle } from "preact-feather"
import { useUiContext, useUiContextFn } from "../../contexts"
import { useTargetContext } from "../../targets"
import { ButtonImg } from "../Controls"
import { useHttpFn } from "../../hooks"
import { espHttpURL } from "../Helpers"

/*
 * Local const
 *
 */

const StatusControls = () => {
    const { status, message, alarmCode, errorCode } = useTargetContext()
    if (!useUiContextFn.getValue("showstatuspanel")) return null
    return (
        <Fragment>
            {status.state && (
                <div class="status-ctrls">
                    <div
                        class="extra-control mt-1 tooltip tooltip-bottom"
                        data-tooltip={T("CN34")}
                    >
                        <div
                            class={`extra-control-header big-text ${
                                status.state == "Alarm" ||
                                status.state == "Error"
                                    ? "text-light bg-error"
                                    : (status.state == "Door") |
                                      (status.state == "Hold")
                                    ? "text-light bg-warning"
                                    : status.state == "Sleep"
                                    ? "text-light bg-dark"
                                    : ""
                            }`}
                        >
                            {T(status.state)}
                        </div>
                        {status.code && (
                            <div class="extra-control-value">
                                {T(status.state + ":" + status.code)}
                            </div>
                        )}
                        {message && (
                            <div class="extra-control-value">{T(message)}</div>
                        )}
                        {(alarmCode != 0 || errorCode != 0) && (
                            <div class="extra-control-value text-error">
                                {T(
                                    alarmCode != 0
                                        ? "ALARM:" + alarmCode
                                        : "error:" + errorCode
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Fragment>
    )
}

const StatusPanel = () => {
    const { toasts, panels } = useUiContext()
    const { status } = useTargetContext()
    const { createNewRequest } = useHttpFn
    const id = "statusPanel"
    const hidePanel = () => {
        useUiContextFn.haptic()
        panels.hide(id)
    }
    const deviceList = [
        {
            name: "S190",
            depend: ["sd"],
            buttons: [
                {
                    cmd: "sdresumecmd",
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: "sdpausecmd",
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: "sdstopcmd",
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
        {
            name: "S188",
            depend: ["tftsd"],
            buttons: [
                {
                    cmd: "tftsdresumecmd",
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: "tftsdpausecmd",
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: "tftsdstopcmd",
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
        {
            name: "S189",
            depend: ["tftusb"],
            buttons: [
                {
                    cmd: "tftusbresumecmd",
                    icon: <PlayCircle />,
                    desc: T("P99"),
                },
                {
                    cmd: "tftusbpausecmd",
                    icon: <PauseCircle />,
                    desc: T("P98"),
                },
                {
                    cmd: "tftusbstopcmd",
                    icon: <StopCircle />,
                    desc: T("P100"),
                },
            ],
        },
    ]

    console.log("Status panel")
    const sendCommand = (command) => {
        createNewRequest(
            espHttpURL("command", { cmd: command }),
            { method: "GET", echo: command },
            {
                onSuccess: (result) => {},
                onFail: (error) => {
                    toasts.addToast({ content: error, type: "error" })
                    console.log(error)
                },
            }
        )
    }
    return (
        <div class="panel panel-dashboard">
            <div class="navbar">
                <span class="navbar-section feather-icon-container">
                    <Layers />
                    <strong class="text-ellipsis">{T("CN34")}</strong>
                </span>
                <span class="navbar-section">
                    <span style="height: 100%;">
                        <span
                            class="btn btn-clear btn-close m-1"
                            aria-label="Close"
                            onclick={hidePanel}
                        />
                    </span>
                </span>
            </div>
            <div class="panel-body panel-body-dashboard">
                <StatusControls />

                {1 &&
                    deviceList.map((device) => {
                        if (
                            !device.depend.every((d) =>
                                useUiContextFn.getValue(d)
                            )
                        )
                            return null
                        return (
                            <fieldset class="fieldset-top-separator fieldset-bottom-separator field-group">
                                <legend>
                                    <label class="m-1">{T(device.name)}</label>
                                </legend>
                                <div class="field-group-content maxwidth">
                                    <div class="print-buttons-container">
                                        {device.buttons.map((button) => (
                                            <ButtonImg
                                                icon={button.icon}
                                                tooltip
                                                data-tooltip={T(button.desc)}
                                                onClick={(e) => {
                                                    useUiContextFn.haptic()
                                                    e.target.blur()
                                                    const cmd =
                                                        useUiContextFn.getValue(
                                                            button.cmd
                                                        )
                                                    const cmds = cmd.split("\n")
                                                    cmds.forEach((cmd) => {
                                                        sendCommand(cmd)
                                                    })
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </fieldset>
                        )
                    })}
            </div>
        </div>
    )
}

const StatusPanelElement = {
    id: "statusPanel",
    content: <StatusPanel />,
    name: "CN34",
    icon: "Layers",
    show: "showstatuspanel",
    onstart: "openstatusonstart",
}

export { StatusPanel, StatusPanelElement, StatusControls }