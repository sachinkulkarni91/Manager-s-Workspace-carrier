import { useState } from 'react'

const toggleNew = () => {
    const [toggled, setToggled] = useState(false);

  return (
    <div style={{
        width: '36px',
        height: '14px',
        border: '1px solid #999',
        borderRadius: '4px',
        backgroundColor: '#e5e7eb',
        position: 'relative',
        overflow: 'visible'
    }}>
        <div style={{
            width: '18px',
            height: '18px',
            borderRadius: '2px',
            backgroundColor: '#fff',
            position: 'absolute',
            left: toggled ? '0' : 'unset',
            right: toggled ? 'unset' : '0',
            top: '50%',
            border: '1px solid #999',
            transform: 'translateY(-50%)',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
        }}
            onClick={() => setToggled(prevState => !prevState)}
        >

        </div>
    </div>
  )
}

export default toggleNew