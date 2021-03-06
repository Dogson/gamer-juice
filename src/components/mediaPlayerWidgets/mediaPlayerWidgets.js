import React from 'react';
import ReactJkMusicPlayer from "react-jinke-music-player";
import 'react-jinke-music-player/assets/index.css'
import {connect} from "react-redux";
import {ACTIONS_MEDIAS} from "../../actions/mediaActions";


class MediaPlayer extends React.Component {

    constructor(props) {
        super(props);

        this.audioInstance = null;

        this.state = {loading: false};
    }

    componentDidUpdate(prevProps) {
        if (this.props.episodePlayed) {
            if (this.hasepisodePlayedChanged(prevProps.episodePlayed, this.props.episodePlayed)) {
                this.audioInstance.playNext();
            } else {
                if (this.isAudioContextDifferentFromState(this.props.playState)) {
                    if (this.props.playState.isPaused) {
                        this.audioInstance.pause();
                    } else {
                        this.audioInstance.play()
                    }
                }
            }
        }
    }

    isAudioContextDifferentFromState(playState) {
        return playState.isPaused !== playState.audioContextPaused;
    }

    hasepisodePlayedChanged(prevMedia, media) {
        return !prevMedia || prevMedia._id !== media._id
    };

    _handlePlay() {
        this.props.dispatch({
            type: ACTIONS_MEDIAS.SET_PLAY_STATE,
            payload: {
                isPaused: false,
                audioContextPaused: false
            }
        });

        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new window.MediaMetadata({
                title: this.props.episodePlayed.name,
                artist: this.props.episodePlayed.singer,
                artwork: [
                    {src: this.props.episodePlayed.cover, sizes: '256*256', type: 'image/png'},
                ]
            });
        }
    }

    _handlePause() {
        this.props.dispatch({
            type: ACTIONS_MEDIAS.SET_PLAY_STATE,
            payload: {
                isPaused: true,
                audioContextPaused: true
            }
        });
    }

    _handleDownload() {
        const link = document.createElement("a");
        link.download = this.props.episodePlayed.musicSrc;
        link.href = this.props.episodePlayed.musicSrc;
        link.click();
        link.remove();
    }


    render() {
        if (!this.props.episodePlayed) {
            return null
        }
        const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        return (
            <>
                <ReactJkMusicPlayer
                    audioLists={[this.props.episodePlayed]}
                    autoPlay={true}
                    glassBg={true}
                    mode="full"
                    autoPlayInitLoadPlayList={true}
                    getAudioInstance={(instance) => (this.audioInstance = instance)}
                    showReload={false}
                    showThemeSwitch={false}
                    showPlayMode={false}
                    onAudioPlay={this._handlePlay.bind(this)}
                    onAudioPause={this._handlePause.bind(this)}
                    onAudioDownload={this._handleDownload.bind(this)}
                    showProgressLoadBar={false}
                    responsive={true}
                    clearPriorAudioLists={true}
                    defaultPosition={vw <= 600 ? {bottom: 70, right: 0} : {bottom: 90, right: 20}}
                    bounds={{bottom: 0, top: 0, right: 0, left: 0}}
                />
            </>
        )
    }
}

const mapStateToProps = state => {
    return {
        episodePlayed: state.mediaReducer.episodePlayed,
        playState: state.mediaReducer.playState
    }
};

export default connect(mapStateToProps)(MediaPlayer);