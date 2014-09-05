<?php
    function find_key($array, $filter){
        foreach($array as $k=>$x){
            if($filter($x)){
                return $k;
            };
        };
    }
    function spaceship($a, $b, $gt){
        return ($a < $b ? -1 : ($a > $b ? 1 : 0)) * ($gt ? 1 : -1);
    };
    header('Content-type: application/json');
    session_start();
    if(isset($_SESSION['all_data'])){
        $all_data=$_SESSION['all_data'];
    }
    else{
        $firstNames=array('John', 'Mike', 'Rich', 'Bill', 'Diana', 'Mark', 'Andrey', 'Benjamin', 'Claude', 'Kevin', 'Eric', 'Ginger', 'Olivia', 'Josh', 'David', 'Joyce', 'Celine');
        $lastNames=array('Burke', 'Lee', 'Smith', 'Doe', 'Glen', 'Jackson', 'Morgan', 'Fleetwood', 'Clapton', 'Rice', 'Slaugher', 'Spacey', 'Backon', 'Wright', 'Siam', 'Emerson');

        $all_data=$_SESSION['all_data']=array_map(function($i)use($firstNames, $lastNames){
            $firstName=$firstNames[array_rand($firstNames)];
            $lastName=$lastNames[array_rand($lastNames)];
            $email=$firstName.'.'.$lastName.'@example.com';
            return array('id'=>$i, 'firstName'=>$firstName, 'lastName'=>$lastName, 'email'=>$email);
        }, range(0, 62));
    };
    $method='';
    if(isset($_GET['method'])){
        $method=$_GET['method'];
    };
    if(isset($_REQUEST['id'])){
        $id=$_REQUEST['id'];
    };
    if($_SERVER['REQUEST_METHOD']==='POST'){
        if($method==='edit'){
            echo '{ "Popup": true, "PopupTitle": "","Url": "form.html#/?id='.((int)$id).'" }';
        }
        elseif($method==='update'){
            //...
            $index=find_key($_SESSION['all_data'], function($x)use($id){return $x['id']===(int)$id;});
            if($index){
                $_SESSION['all_data'][$index]['firstName']=$_POST['firstName'];
                $_SESSION['all_data'][$index]['lastName']=$_POST['lastName'];
                $_SESSION['all_data'][$index]['email']=$_POST['email'];
                echo '{"message":"Your data has been saved successfully."}';
            };
        }
        elseif($method==='destroy'){
            $_SESSION['all_data']=array_filter($all_data, function($x)use($id){return $x['id']!==(int)$id;});
            echo '{"angrid":"refresh"}';
        }
        elseif($method==='destroymany'){
            if(is_array($id)){
                $_SESSION['all_data']=array_filter($all_data, function($x)use($id){return !in_array($x['id'], $id);});
            };
            echo '{"angrid":"refresh"}';
            //echo null;
        };
    }
    else{
        if($method==='show'){
            echo json_encode($all_data[(int)$id]);
        }
        else{
            $page=(int) $_GET['page'];
            $page_size=(int) $_GET['pagesize'];
            $offset=($page - 1) * $page_size;
            if(isset($_GET['search']) && $_GET['search']!=''){
                $search=$_GET['search'];
                $search_results=array_filter($all_data, function($x)use($search){return stripos($x['firstName'], $search)!==false || stripos($x['lastName'], $search)!==false || stripos($x['email'], $search)!==false;});
            }
            else{
                $search_results=$all_data;
            };
            if($method==='getfilters'){
                $filter_name=$_GET['filterName'];
                $filters=array_values(array_unique(array_map(function($x)use($filter_name){return $x[$filter_name];}, $search_results)));
                sort($filters);
                echo json_encode($filters);
            }
            else{
                if(isset($_GET['filter-firstName'])){
                    $filter_first_name=$_GET['filter-firstName'];
                    $search_results=array_filter($search_results, function($x)use($filter_first_name){return $x['firstName']===$filter_first_name;});
                };
                if(isset($_GET['filter-lastName'])){
                    $filter_last_name=$_GET['filter-lastName'];
                    $search_results=array_filter($search_results, function($x)use($filter_last_name){return $x['lastName']===$filter_last_name;});
                };
                if(isset($_GET['sort'])){
                    $sort_by=$_GET['sort'];
                    if($sort_by!==''){
                        $sort_asc=$_GET['sortAsc'] === 'true' ? true : false;
                        usort($search_results, function($a, $b)use($sort_by, $sort_asc){
                            return spaceship($a[$sort_by], $b[$sort_by], $sort_asc);
                        });
                    };
                };
                $data_results=array_slice($search_results, $offset, $page_size);
                $data=array('TotalResults'=>count($search_results), 'Results'=>$data_results);
                echo json_encode($data);
            };
        }
    }
?>
