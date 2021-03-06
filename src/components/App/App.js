import React, {
	useState,
	useEffect,
	useRef,
	useMemo,
	useCallback
} from 'react';

import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../../constants';

import { renderStartBackground } from '../../js/Render';
import { Game } from '../../js/Game.js';

import { Settings } from '../Settings';

let sirtet;

const App = () => {
	const [customization, setCustomization] = useState({
		colors: 0,
		style: 0,
		level: 0,
		screenShake: true,
		fxVolume: 0.3,
		musicVolume: 0.1
	});
	const canvasRef = useRef();
	const [gameState, setGameState] = useState({
		// the game has started
		started: false,
		// the game is over
		over: false,
		// the game is paused
		paused: false
	});
	const [gameStats, setGameStats] = useState({
		score: 0,
		lines: 0,
		level: 0,
		next: null
	});
	const [gameMuted, setGameMuted] = useState(false);
	const [backgroundImage, setBackgroundImage] = useState(null);
	const [countdownStyle, setCountdownStyle] = useState({ opacity: 1 });
	const [countdownText, setCountdownText] = useState('');
	const [showSettings, setShowSettings] = useState(false);

	useEffect(() => {

		canvasRef.current.width = CANVAS_WIDTH;
		canvasRef.current.height = CANVAS_HEIGHT;
		const ctx = canvasRef.current.getContext('2d');

		// render static background for start screen
		renderStartBackground().then(setBackgroundImage);

		window.gameContext = ctx;

		// create game
		sirtet = new Game(
			canvasRef.current,
			gameStartHandler,
			gameOverHandler,
			gamePauseHandler,
			setGameStats,
			gameCountdownHandler
		);

		sirtet.init();

		// add game event listener
		window.addEventListener('blur', sirtet.pauseGame, false);

		return () => {
			window.removeEventListener('blur', sirtet.pauseGame, false);
		};
	}, []);

	const gameStartHandler = useCallback(() => {
		setGameState({
			started: true,
			over: false,
			paused: false
		});
	}, []);

	const gameOverHandler = useCallback(() => {
		setGameState({
			started: true,
			over: true,
			paused: false
		});
	}, []);

	const gamePauseHandler = useCallback((paused) => {
		setGameState({
			started: true,
			over: false,
			paused
		});
	}, []);

	const muteHandler = useCallback(() => {
		if (!gameMuted) {
			setGameMuted(true);
			sirtet.setMuted(true);
		} else {
			setGameMuted(false);
			sirtet.setMuted(false);
		}
	}, [gameMuted]);

	const startGameHandler = useCallback(() => {
		sirtet.startGame(customization);
		setGameStats({
			score: 0,
			lines: 0,
			level: 0,
			next: null
		});
	}, [customization]);

	const gameCountdownHandler = useCallback((count) => {
		setCountdownText(count);
		setCountdownStyle({ opacity: 1, transition: 'none' });

		setTimeout(() => {
			setCountdownStyle({
				opacity: 0,
				transition: 'opacity 1s ease-in-out'
			});
		});
	}, []);

	const resetGameHandler = useCallback(() => {
		setGameState({
			started: false,
			over: false,
			paused: false
		});
		setGameStats({
			score: 0,
			lines: 0,
			level: 0,
			next: null
		});
		sirtet.resetGame();
	}, []);

	const showSettingsHandler = () => {
		setShowSettings(true);
	};

	const hideSettingsHandler = () => {
		setShowSettings(false);
	};

	const mainOverlay = useMemo(() => {
		if (gameState.started) return null;

		const overlayStyle = {
			background: backgroundImage
				? `url(${backgroundImage.src})`
				: 'unset'
		};

		const overlayClass = `canvas__overlay vignette ${
			backgroundImage ? 'animate__animated animate__fadeIn' : ''
		}`;

		return (
			<div className={overlayClass} style={overlayStyle}>
				{!showSettings ? (
					<>
						<h1 className="display-3">Sirtet</h1>
						<button
							className="btn btn-primary mb-3"
							onClick={startGameHandler}
						>
							Play
						</button>
						<button
							className="btn btn-outline-light"
							onClick={showSettingsHandler}
						>
							Settings
						</button>
					</>
				) : (
					<Settings
						customization={customization}
						setCustomization={setCustomization}
						onHide={hideSettingsHandler}
						onTestSound={sirtet.playTestSound}
					/>
				)}
			</div>
		);
	}, [gameState, showSettings, backgroundImage, customization]);

	const gameOverOverlay = useMemo(() => {
		if (!gameState.over) return null;

		return (
			<div className="canvas__overlay bg-overlay animate__animated animate__fadeIn">
				<h1>Game over!</h1>
				<br />
				<button
					className="btn btn-primary btn-lg mb-3"
					onClick={startGameHandler}
				>
					Try again
				</button>
				<button
					className="btn btn-outline-light"
					onClick={resetGameHandler}
				>
					Menu
				</button>
			</div>
		);
	}, [gameState]);

	const pauseOverlay = useMemo(() => {
		if (!gameState.paused || !gameState.started || gameState.over)
			return null;

		return (
			<div className="canvas__overlay bg-overlay">
				<h1>Paused</h1>
				<br />
				<button
					className="btn btn-primary btn-lg"
					onClick={sirtet.resumeGame}
				>
					Resume
				</button>
			</div>
		);
	}, [gameState]);

	const countdownOverlay = useMemo(() => {
		if (
			!countdownText ||
			!gameState.started ||
			gameState.paused ||
			gameState.over
		)
			return null;

		return (
			<div className="canvas__overlay" style={countdownStyle}>
				<h1 className="display-1">{countdownText}</h1>
			</div>
		);
	}, [countdownStyle, countdownText, gameState]);

	return (
		<>
			<div className="d-flex justify-content-center no-select">
				<div className="canvas__container">
					<canvas width="360" height="720" ref={canvasRef}></canvas>
					{mainOverlay}
					{gameOverOverlay}
					{pauseOverlay}
					{countdownOverlay}
				</div>
				<div className="ui__group ml-3">
					<div className="border rounded mb-3 p-3">
						<h3 className="m-0">
							<u>Score</u>
							<br />
							{gameStats.score}
						</h3>
					</div>
					<div className="border rounded mb-3 p-3">
						<h3 className="m-0">
							<u>Lines</u>
							<br />
							{gameStats.lines}
						</h3>
					</div>
					<div className="border rounded mb-3 p-3">
						<h3 className="m-0">
							<u>Level</u>
							<br />
							{gameStats.level}
						</h3>
					</div>
					<div className="border rounded mb-3 p-3">
						<h3 className="m-0">
							<u>Next</u>
							<br />
							<img
								src={
									gameStats.next ? gameStats.next.src : undefined
								}
							/>
						</h3>
					</div>

					<button
						className="btn btn-outline-dark btn-sm"
						onClick={muteHandler}
					>
						{gameMuted ? 'unmute' : 'mute'}
					</button>
				</div>
			</div>
			<div className="w-100 text-left d-inline-block p-3">
				<a className="text-dark" href="https://github.com/greeneman42/sirtet" target="_">
					Github
				</a>				
			</div>
		</>
	);
};

export default App;
