import React, {Component} from 'react';
import {Helmet} from "react-helmet";
import {DebounceInput} from 'react-debounce-input';
import cx from "classnames";
import styles from "./homepage.module.scss";
import logo from "../assets/images/logo.png";
import PageLayout from "../layouts/PageLayout";
import {getAllGames, getGamesBySearch} from "../endpoints/gamesEndpoint";
import {connect} from "react-redux";
import {ACTIONS_GAMES} from "../actions/gamesActions";
import {FaSearch, FaGamepad} from "react-icons/fa";
import {withRouter} from 'react-router-dom'
import queryString from "query-string";
import InfiniteScroll from 'react-infinite-scroller';


class Homepage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasMoreGames: true
        };

        this._handleChange = this._handleChange.bind(this);
        this._handleKeyPress = this._handleKeyPress.bind(this);
        this.getMoreGames = this.getMoreGames.bind(this);
    }

    componentWillReceiveProps(nextProps, nextContext) {
        const nextValues = queryString.parse(nextProps.location.search);
        const currentValues = queryString.parse(this.props.location.search);
        if (nextValues.q !== currentValues.q) {
            this.props.dispatch({type: ACTIONS_GAMES.SET_SEARCH_INPUT, payload: nextValues.q || ""});
            // this.setState({noMoreGames: true});
            // getGamesBySearch({search: nextValues.q}).then((result) => {
            //     this.setState({noMoreGames: false});
            //     this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: result});
            //     this.setState({isLoading: false})
            // });
        }
    }

    _handleChange(value) {
        this.props.history.push(`/?q=${value}`);
    }

    _handleKeyPress(e) {
        if (e.key === 'Enter') {
            // this.setState({noMoreGames: false});
            // getGamesBySearch({search: this.props.searchInput}).then((result) => {
            //     this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: result});
            //     this.setState({isLoading: false})
            // });
        }
    }

    getMoreGames() {
        const lastDoc = this.props.lastDoc;
        const previousGamesArray = this.props.games || [];
        getAllGames({lastDoc}).then((result) => {
            if (result.games.length === 0) {
                this.setState({hasMoreGames: false});
            }
            this.props.dispatch({type: ACTIONS_GAMES.SET_GAMES, payload: {games: previousGamesArray.concat(result.games), lastDoc: result.lastDoc}});
        });
    }


    //render functions

    renderGameGrid() {
        return <InfiniteScroll
            pageStart={0}
            loadMore={this.getMoreGames}
            hasMore={this.state.hasMoreGames}
            loader={<div className={styles.loaderContainer} key={0}><Loading isLoading={true}/></div>}
        >
            <GameGrid games={this.props.games}/>
        </InfiniteScroll>
    };

    render() {
        return <PageLayout>
            <Helmet>
                <title>{this.props.searchInput && this.props.searchInput.length > 0 ? `Recherche: ${this.props.searchInput}` : 'gamer juice for my gamer mouth'}</title>
            </Helmet>
            <div className={styles.subtitle}>Soif de bons <strong>médias vidéoludiques ?</strong></div>
            <div className={cx(styles.inputContainer, {[styles.focus]: this.state.inputFocused})}>
                <FaSearch className={styles.icon}/>
                <DebounceInput
                    value={this.props.searchInput}
                    className={styles.input}
                    minLength={2}
                    debounceTimeout={300}
                    onChange={(e) => this._handleChange(e.target.value)}
                    onKeyPress={this._handleKeyPress}
                    placeholder="Rechercher un jeu"
                    onFocus={() => this.setState({inputFocused: true})}
                    onBlur={() => this.setState({inputFocused: false})}/>
            </div>
            {this.renderGameGrid()}
        </PageLayout>
    }
}

const GameGrid = ({games}) => {
    if (!games)
        return null;
    if (games.length === 0) {
        return <div className={styles.noResultContainer}>
            <div><strong>Aucun jeu ne correspond à votre recherche.</strong></div>
            <div>Une typo peut-être ?</div>
        </div>
    }
    return <div className={styles.gamesGridContainer}>
        {
            games.map((game) => {
                return <div className={cx(styles.flipCard, styles.gameCardContainer)} key={game.id}>
                    <div className={styles.flipCardInner}>
                        <div className={styles.flipCardFront}>
                            <img src={game.cover} alt={game.name}/>
                            <div>{game.popularity}</div>
                        </div>
                        <div className={styles.flipCardBack}>
                            <div className={styles.backColor}/>
                            <div className={styles.backImage} style={{backgroundImage: `url(${game.cover})`}}>
                            </div>
                            <div className={styles.title}>
                                {game.name}
                            </div>
                            <div className={styles.releaseDateContainer}>
                                {game.releaseDate}
                            </div>
                        </div>
                    </div>
                </div>
            })
        }
    </div>
}

const Loading = ({isLoading}) => {
    if (!isLoading) {
        return null;
    }
    return <div className={styles.loadingContainer}>
        <div className={styles.flipCard}>
            <div className={cx(styles.flipCardInner, styles.rotateVertCenter)}>
                <div className={styles.flipCardFront}>
                    <img src={logo} alt={"loading"} className={styles.icon}/>
                </div>
                <div className={styles.flipCardBack}>
                    <FaGamepad className={styles.icon}/>
                </div>
            </div>
        </div>
    </div>
};

const mapStateToProps = state => {
    return {
        games: state.gamesReducer.games,
        searchInput: state.gamesReducer.searchInput,
        lastDoc: state.gamesReducer.lastDoc
    }
};

export default withRouter(connect(mapStateToProps)(Homepage));