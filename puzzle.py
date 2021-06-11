import random
from decorators import i_am_rpc_with_settings

@i_am_rpc_with_settings(check_session=False)
def random_arr(self, params):
    arr = [1, 2, 3, 4, 5, 6, 7, 8, 0]
    pos = {
                0: [1, 3],
                1: [0, 2, 4],
                2: [1, 5],
                3: [0, 4, 6],
                4: [1, 3, 5, 7],
                5: [2, 4, 8],
                6: [3, 7],
                7: [4, 6, 8],
                8: [5, 7]
            }
    free = 8
    for _ in range(50):   
        r = random.randint(0, len(pos[free]) - 1)
        pos_free_r = pos[free][r]
        arr[free], arr[pos_free_r], free = arr[pos_free_r], arr[free], pos_free_r
        
    return arr    
        
@i_am_rpc_with_settings(check_session=False)
def move(self, params):
    
    new_arr = params["new_arr"]      
    box_no = 0
    for i in range(3):       
        for j in range(3):
            for n in range(8):
                if new_arr[i][j] == n + 1:
                    if j > 0 and j - 1 >= 0 and new_arr[i][j-1] ==0:
                        box_no = n + 1
                        return box_no
                    elif j < 3 and j + 1 < 3 and new_arr[i][j+1] ==0:
                        box_no = n + 1
                        return box_no
                    elif i > 0 and i - 1 >= 0 and new_arr[i-1][j] ==0:
                        box_no = n + 1
                        return box_no
                    elif  i < 3 and i + 1 < 3 and new_arr[i+1][j] ==0:
                        box_no = n + 1
                        return box_no
    return box_no
