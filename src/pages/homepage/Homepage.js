import React, {Component} from 'react';
import {Helmet} from "react-helmet";
import {DebounceInput} from 'react-debounce-input';
import cx from "classnames";
import styles from "./homepage.module.scss";
import PageLayout from "../../layouts/PageLayout";
import {getGamesBySearch} from "../../endpoints/gamesEndpoint";
import {connect} from "react-redux";
import {ACTIONS_GAMES} from "../../actions/gamesActions";
import {FaSearch} from "react-icons/fa";
import {LoadingSpinner} from "../../components/loadingSpinner/loadingSpinner"
import {withRouter} from 'react-router-dom'
import queryString from "query-string/index";
import InfiniteScroll from 'react-infinite-scroller';
import * as moment from "moment/moment";
import ReactTooltip from "react-tooltip";


class Homepage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasMoreGames: true,
            loading: false,
        };

        this._handleChange = this._handleChange.bind(this);
        this.getMoreGames = this.getMoreGames.bind(this);
        this.setCurrentGame = this.setCurrentGame.bind(this);
    }

    componentDidMount() {
        this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: {games: [], page: 1}});
        this.props.dispatch({type: ACTIONS_GAMES.SET_CURRENT_GAME, payload: null});
    }

    componentWillUnmount() {
        this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: {games: [], page: 1}});
    }

    componentDidUpdate(prevProps) {
        const currentValues = queryString.parse(this.props.location.search);
        const prevValues = queryString.parse(prevProps.location.search);
        if (prevValues.q !== currentValues.q) {
            this.setState({hasMoreGames: true});
        }

        if (this.props.currentGame) {
            this.props.history.push(`/game/${this.props.currentGame._id}`)
        }

        if (currentValues.q !== prevValues.q) {
            this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: {games: [], page: 1}});
        }
    }

    _handleChange(value) {
        this.props.history.push(`/?q=${value}`);
    }

    setCurrentGame(game) {
        this.props.dispatch({type: ACTIONS_GAMES.SET_CURRENT_GAME, payload: game});
    }

    async getMoreGames() {
        const searchInput = queryString.parse(this.props.location.search).q;
        if (this.state.loading) {
            return;
        }
        this.setState({loading: true});
        const page = this.props.page || 1;
        const search = searchInput;
        const previousGamesArray = this.props.games || [];
        const games = await getGamesBySearch({name: search, page});
        this.setState({hasMoreGames: games.length > 0 && (!search || search.length === 0)});
        this.props.dispatch({
            type: ACTIONS_GAMES.SET_GAMES,
            payload: {games: previousGamesArray.concat(games), page: page + 1}
        });
        this.setState({loading: false})
    }


    //render functions

    renderGameGrid() {
        return <InfiniteScroll
            loadMore={this.getMoreGames}
            hasMore={this.state.hasMoreGames}
            loader={<div className={styles.loaderContainer} key={0}><LoadingSpinner/></div>}
        >
            <GameGrid games={this.props.games} loading={this.state.loading} setCurrentGame={this.setCurrentGame}/>
        </InfiniteScroll>
    };

    render() {
        const searchInput = queryString.parse(this.props.location.search).q;
        return <PageLayout>
            <Helmet>
                <title>{this.props.searchInput && this.props.searchInput.length > 0 ? `Recherche: ${this.props.searchInput}` : 'gamer juice for my gamer mouth'}</title>
            </Helmet>
            <div className={styles.subtitle}>Soif de bons médias vidéoludiques ?</div>
            <div className={cx(styles.inputContainer, {[styles.focus]: this.state.inputFocused})}>
                <FaSearch className={styles.icon}/>
                <DebounceInput
                    value={searchInput}
                    className={styles.input}
                    minLength={2}
                    debounceTimeout={300}
                    onChange={(e) => this._handleChange(e.target.value)}
                    placeholder="Rechercher un jeu"
                    onFocus={() => this.setState({inputFocused: true})}
                    onBlur={() => this.setState({inputFocused: false})}/>
            </div>
            {this.renderGameGrid()}
        </PageLayout>
    }
}

const GameGrid = ({games, loading, setCurrentGame}) => {
    if (!games)
        return null;
    if (games.length === 0 && !loading) {
        return <div className={styles.noResultContainer}>
            <div><strong>Aucun jeu ne correspond à votre recherche.</strong></div>
            <div>Cela signifie probablement qu'aucun média n'a été encore publié à son sujet.</div>
        </div>
    }
    return <div className={styles.gamesGridContainer}>
        {
            games.map((game) => {
                return <div className={styles.cardContainer} key={game.id} onClick={() => setCurrentGame(game)}>
                    <div className={styles.backImage} style={{backgroundImage: `url(${game.cover})`}}/>
                    <div className={styles.hoveredInfo}>
                        <div className={styles.backColor}/>
                        <div className={styles.title}>
                            {game.name}
                        </div>
                        <div className={styles.secondaryInfoContainer}>
                            {moment.isMoment(game.releaseDate) ? game.releaseDate.format('YYYY') : "A venir"}
                        </div>
                        <MediaLogos game={game}/>
                    </div>
                </div>
            })
        }
    </div>
};

const MediaLogos = ({game}) => {
    return <div className={styles.mediasLogosContainer}>
        {
            game.medias.map((media) => {
                return <div key={media.name} className={styles.mediaLogo}>
                    <ReactTooltip effect="solid" id="mediaLogo" place="top"/>
                    <img src={media.logoMin} alt={media.name} data-tip={media.name} data-for="mediaLogo"/>
                </div>
            })
        }

    </div>
};

const mapStateToProps = state => {
    return {
        games: state.gamesReducer.games,
        searchInput: state.gamesReducer.searchInput,
        page: state.gamesReducer.page,
        currentGame: state.gamesReducer.currentGame
    }
};

export default withRouter(connect(mapStateToProps)(Homepage));