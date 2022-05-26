import {getContext} from "./audio";

export interface OscStereoConstraints{
    type: "oscstereo";
    sampleRate: number;
    frequency: number;
    gainLeft: number;
    gainRight: number;
}

export function getOscStereoTrack(constraint: OscStereoConstraints){
    const {
        sampleRate = 48000,
        frequency = 200,
        gainLeft = 1,
        gainRight = 1,
    } = constraint
    // 延迟 = 半波长的整数倍
    const delay = 1 / frequency / 2
    const audioCtx = getContext(sampleRate)

    // 振荡器节点
    const oscillatorNode = audioCtx.createOscillator();
    oscillatorNode.type = 'sine';
    oscillatorNode.frequency.value = frequency; // value in hertz
    oscillatorNode.start();

    // 左声道音量节点
    const gainNodeLeft = audioCtx.createGain()
    gainNodeLeft.gain.value = gainLeft

    // 右声道音量节点
    const gainNodeRight = audioCtx.createGain()
    gainNodeLeft.gain.value = gainRight

    // 延时节点
    const delayNode:DelayNode = new DelayNode(audioCtx)
    delayNode.delayTime.value = delay

    // 声道合并节点
    const mergerNode:ChannelMergerNode = new ChannelMergerNode(audioCtx)

    // 输出节点
    const destinationNode = audioCtx.createMediaStreamDestination()

    // 连接
    oscillatorNode.connect(gainNodeLeft)
    oscillatorNode.connect(gainNodeRight)
    gainNodeRight.connect(delayNode)

    // 正确接法
    gainNodeLeft.connect(mergerNode, 0, 0)
    delayNode.connect(mergerNode, 0, 1)
    mergerNode.connect(destinationNode)
    // 测试接法(单声道抵消)
    // gainNodeLeft.connect(destinationNode)
    // delayNode.connect(destinationNode)

    const track = destinationNode.stream.getAudioTracks()[0];
    return {
        track,
        context: audioCtx,
        destination: destinationNode,

        oscillatorNode,
        gainNodeLeft,
        gainNodeRight,
        mergerNode,
        delayNode
    };
}
