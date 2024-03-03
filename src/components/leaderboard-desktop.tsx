import { ClashData, ClashDataMap } from '@/types'
import Column from './column'
import { PurpleArrowLeft, PurpleArrowRight } from './icons'

export type LeaderboardProps = {
  leaderboard: ClashDataMap[]
  currentDay: number
}

export default function LeaderboardDesktop(props: LeaderboardProps) {
  const { leaderboard, currentDay } = props

  const renderDay = (
    day: number,
    from: number,
    to: number,
    color: string,
    dayFourIndex?: number
  ) => {
    return (
      <>
        <div
          className="column-day justify-between-grid"
          style={{ position: 'relative', backgroundColor: color, margin: 10 }}
        >
          <p className="day-title">Day {day}</p>
          {leaderboard && leaderboard[day] && (
            <Column
              currentDay={currentDay}
              dayFourIndex={dayFourIndex}
              to={to}
              from={from}
              clashDataForDay={
                // @ts-ignore
                leaderboard[day] as any
              }
              day={day}
            />
          )}
          {day === 5 ? (
            <div className="justify-between-grid">
              <div className="pair">
                <br></br>
                <br></br>
                <div className="channel-name-box">mfers</div>
              </div>
            </div>
          ) : null}
          <div style={{ height: 300 }}></div>

          <div style={{ position: 'absolute', bottom: 0 }}>
            <img width="100%" src={`whale_day_${day}.jpg`}></img>
          </div>
        </div>
      </>
    )
  }

  console.log(leaderboard, 'leaderboard')
  return (
    <div className="body-desktop">
      <div className="flex-direction-row">
        {' '}
        <PurpleArrowRight />{' '}
        <b style={{ marginLeft: 15, marginRight: 15 }}> WINNER </b>
        <PurpleArrowLeft />
      </div>

      <div className="flex-direction-row ">
        {renderDay(1, 0, 4, '#FFE2E2')}
        {renderDay(2, 0, 2, '#FCFCCB')}
        {renderDay(3, 0, 1, '#D1FFD2')}
        {renderDay(4, 1, 1, '#CBE1FF', 1)}
        {renderDay(5, 0, 0, '#B8B2FF')}
        {renderDay(4, 1, 1, '#CBE1FF', 2)}
        {renderDay(3, 1, 2, '#D1FFD2')}
        {renderDay(2, 2, 4, '#FCFCCB')}
        {renderDay(1, 4, 8, '#FFE2E2')}
      </div>
    </div>
  )
}
